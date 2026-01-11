/**
 * Keepa Sync Service
 *
 * Manages product data synchronization from Keepa API.
 *
 * Strategy: Maximize products with 1-2x daily updates
 * - No tiers, all products treated equally
 * - Simple daily refresh for all products
 * - ~25,000 products possible with 1x daily update
 */

import { db } from "@/db";
import { priceHistory, prices, products } from "@/db/schema";
import type { CategorySlug } from "@/lib/categories";
import { getChildCategories } from "@/lib/categories";
import { asc, eq, lt, sql } from "drizzle-orm";

import {
  getBestsellers,
  getProducts,
  type KeepaProductRaw,
} from "./product-discovery";
import {
  getMaxProductsToday,
  getRecommendedBatchSize,
  getTokenStatus,
  hasTokenBudget,
  recordTokenUsage,
} from "./token-tracker";

/**
 * Sync configuration - simplified for max products
 */
export const SYNC_CONFIG = {
  // Update all products once per day
  refreshIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
  // Batch size for processing
  batchSize: 100,
  // Delay between batches (ms) to avoid rate limits
  batchDelayMs: 500,
} as const;

/**
 * Get all active (non-hidden) categories
 */
export function getActiveCategories(): CategorySlug[] {
  const parentSlug = "electronics" as CategorySlug;
  const children = getChildCategories(parentSlug);
  return children.filter((cat) => !cat.hidden).map((cat) => cat.slug);
}

/**
 * Get count of products in database
 */
export async function getProductCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);
  return result[0]?.count || 0;
}

/**
 * Get products that need refresh (older than 24 hours)
 */
export async function getProductsNeedingRefresh(
  limit?: number,
): Promise<{ asin: string; category: string }[]> {
  const cutoff = new Date(Date.now() - SYNC_CONFIG.refreshIntervalMs);
  const maxProducts = limit || getMaxProductsToday();

  if (maxProducts <= 0) {
    return [];
  }

  const staleProducts = await db
    .select({
      asin: products.asin,
      category: products.category,
    })
    .from(products)
    .where(lt(products.updatedAt, cutoff))
    .orderBy(asc(products.updatedAt))
    .limit(maxProducts);

  return staleProducts;
}

/**
 * Run daily sync - updates all stale products
 */
export async function runDailySync(): Promise<{
  success: boolean;
  productsUpdated: number;
  tokensUsed: number;
  errors: string[];
}> {
  const result = {
    success: true,
    productsUpdated: 0,
    tokensUsed: 0,
    errors: [] as string[],
  };

  // Check token budget
  const tokenStatus = getTokenStatus();
  if (!tokenStatus.canProceed) {
    result.success = false;
    result.errors.push("Daily token budget exhausted");
    return result;
  }

  // Get products needing refresh
  const staleProducts = await getProductsNeedingRefresh();

  if (staleProducts.length === 0) {
    console.log("[Sync] No stale products to update");
    return result;
  }

  console.log(`[Sync] Found ${staleProducts.length} products to update`);

  // Process in batches
  const asins = staleProducts.map((p) => p.asin);
  const batches = chunkArray(asins, SYNC_CONFIG.batchSize);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Check if we still have budget
    if (!hasTokenBudget(batch.length)) {
      console.log(`[Sync] Token budget exhausted after ${i} batches`);
      break;
    }

    try {
      // Fetch from Keepa (Germany only)
      const keepaProducts = await getProducts(batch, "de", {
        includeHistory: false, // Skip history to save bandwidth
        days: 0,
      });

      // Record token usage (1 token per product)
      const tokensUsed = keepaProducts.length;
      recordTokenUsage(tokensUsed);
      result.tokensUsed += tokensUsed;

      // Update database
      for (const keepaProduct of keepaProducts) {
        try {
          await upsertProductFromKeepa(keepaProduct);
          result.productsUpdated++;
        } catch (error) {
          result.errors.push(`Failed to update ${keepaProduct.asin}: ${error}`);
        }
      }

      console.log(
        `[Sync] Batch ${i + 1}/${batches.length}: Updated ${keepaProducts.length} products`,
      );

      // Delay between batches
      if (i < batches.length - 1) {
        await sleep(SYNC_CONFIG.batchDelayMs);
      }
    } catch (error) {
      result.errors.push(`Batch ${i + 1} failed: ${error}`);
    }
  }

  console.log(
    `[Sync] Complete: ${result.productsUpdated} products updated, ${result.tokensUsed} tokens used`,
  );

  return result;
}

/**
 * Discover new products for a category
 */
export async function discoverProducts(
  category: CategorySlug,
  limit: number = 100,
): Promise<{
  success: boolean;
  newProducts: number;
  tokensUsed: number;
  errors: string[];
}> {
  const result = {
    success: true,
    newProducts: 0,
    tokensUsed: 0,
    errors: [] as string[],
  };

  // Check token budget
  if (!hasTokenBudget(limit + 10)) {
    result.success = false;
    result.errors.push("Insufficient token budget for discovery");
    return result;
  }

  try {
    // Get bestsellers from Keepa
    const asins = await getBestsellers(category, "de", limit);

    if (asins.length === 0) {
      console.log(`[Discovery] No products found for category: ${category}`);
      return result;
    }

    // Fetch product details
    const keepaProducts = await getProducts(asins, "de", {
      includeHistory: false,
      days: 0,
    });

    // Record token usage
    const tokensUsed = keepaProducts.length + 1; // +1 for bestseller query
    recordTokenUsage(tokensUsed);
    result.tokensUsed = tokensUsed;

    // Check which are new (not in database)
    for (const keepaProduct of keepaProducts) {
      const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.asin, keepaProduct.asin))
        .limit(1);

      if (existing.length === 0) {
        await upsertProductFromKeepa(keepaProduct, category);
        result.newProducts++;
      } else {
        // Update existing product
        await upsertProductFromKeepa(keepaProduct);
      }
    }

    console.log(
      `[Discovery] ${category}: Found ${result.newProducts} new products, ${tokensUsed} tokens used`,
    );
  } catch (error) {
    result.success = false;
    result.errors.push(`Discovery failed: ${error}`);
  }

  return result;
}

/**
 * Import products for all categories (initial population)
 */
export async function importAllCategories(
  productsPerCategory: number = 50,
): Promise<{
  success: boolean;
  totalProducts: number;
  tokensUsed: number;
  categories: Record<string, number>;
  errors: string[];
}> {
  const result = {
    success: true,
    totalProducts: 0,
    tokensUsed: 0,
    categories: {} as Record<string, number>,
    errors: [] as string[],
  };

  const categories = getActiveCategories();
  console.log(`[Import] Starting import for ${categories.length} categories`);

  for (const category of categories) {
    // Check budget before each category
    if (!hasTokenBudget(productsPerCategory + 10)) {
      console.log(`[Import] Token budget low, stopping at ${category}`);
      result.success = false;
      result.errors.push("Token budget exhausted");
      break;
    }

    try {
      const catResult = await discoverProducts(category, productsPerCategory);
      result.categories[category] = catResult.newProducts;
      result.totalProducts += catResult.newProducts;
      result.tokensUsed += catResult.tokensUsed;
      result.errors.push(...catResult.errors);

      // Small delay between categories
      await sleep(1000);
    } catch (error) {
      result.errors.push(`${category}: ${error}`);
    }
  }

  console.log(
    `[Import] Complete: ${result.totalProducts} products imported, ${result.tokensUsed} tokens used`,
  );

  return result;
}

/**
 * Upsert a product from Keepa data
 */
async function upsertProductFromKeepa(
  keepaProduct: KeepaProductRaw,
  category?: CategorySlug,
): Promise<void> {
  const now = new Date();

  // Extract price data from Keepa stats
  const currentStats = keepaProduct.stats?.current || [];
  const amazonPrice = keepaPriceToDecimal(currentStats[0]); // Amazon price
  const newPrice = keepaPriceToDecimal(currentStats[1]); // Marketplace new
  const usedPrice = keepaPriceToDecimal(currentStats[2]); // Marketplace used
  const listPrice = keepaPriceToDecimal(currentStats[4]); // MSRP/List price

  // Extract ratings, sales rank, and offer counts
  const salesRank =
    currentStats[3] && currentStats[3] > 0 ? currentStats[3] : null;
  const offerCountNew =
    currentStats[11] && currentStats[11] > 0 ? currentStats[11] : null;
  const offerCountUsed =
    currentStats[12] && currentStats[12] > 0 ? currentStats[12] : null;
  const rating =
    currentStats[16] && currentStats[16] > 0
      ? currentStats[16] / 10 // Keepa stores rating * 10
      : null;
  const reviewCount =
    currentStats[17] && currentStats[17] > 0 ? currentStats[17] : null;

  // Extract price statistics
  const minStats = keepaProduct.stats?.min || [];
  const maxStats = keepaProduct.stats?.max || [];
  const avg30Stats = keepaProduct.stats?.avg30 || [];
  const priceMin = keepaPriceToDecimal(minStats[0]); // All-time lowest Amazon price
  const priceMax = keepaPriceToDecimal(maxStats[0]); // All-time highest Amazon price
  const priceAvg30 = keepaPriceToDecimal(avg30Stats[0]); // 30-day average

  // Monthly sold and Prime eligibility
  const monthlySold = keepaProduct.monthlySold || null;
  const primeEligible = keepaProduct.fbaFees !== undefined; // FBA = Prime eligible

  // Get GTIN (prefer EAN, fallback to UPC)
  const gtin = keepaProduct.eanList?.[0] || keepaProduct.upcList?.[0] || null;

  // Get MPN
  const mpn = keepaProduct.mpn || null;

  // Get brand (fallback to manufacturer)
  const brand = keepaProduct.brand || keepaProduct.manufacturer || null;

  // Generate slug from title
  const slug = generateSlug(keepaProduct.title || keepaProduct.asin);

  // Get first image URL
  let imageUrl: string | undefined;
  if (keepaProduct.imagesCSV) {
    const firstImage = keepaProduct.imagesCSV.split(",")[0];
    if (firstImage) {
      imageUrl = `https://images-na.ssl-images-amazon.com/images/I/${firstImage}`;
    }
  }

  // Upsert product with all fields
  await db
    .insert(products)
    .values({
      asin: keepaProduct.asin,
      slug,
      title: keepaProduct.title || keepaProduct.asin,
      brand,
      gtin,
      mpn,
      category: category || ("hard-drives" as CategorySlug),
      imageUrl,
      rating,
      reviewCount,
      salesRank,
      monthlySold,
      offerCountNew,
      offerCountUsed,
      primeEligible,
      features: keepaProduct.features
        ? JSON.stringify(keepaProduct.features)
        : undefined,
      description: keepaProduct.description,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: products.asin,
      set: {
        title: keepaProduct.title || keepaProduct.asin,
        brand,
        gtin,
        mpn,
        imageUrl,
        rating,
        reviewCount,
        salesRank,
        monthlySold,
        offerCountNew,
        offerCountUsed,
        primeEligible,
        features: keepaProduct.features
          ? JSON.stringify(keepaProduct.features)
          : undefined,
        description: keepaProduct.description,
        updatedAt: now,
      },
    });

  // Get product ID for price updates
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.asin, keepaProduct.asin))
    .limit(1);

  if (!product) return;

  // Upsert price for Germany with all statistics
  const bestPrice = amazonPrice || newPrice;
  if (bestPrice !== null) {
    await db
      .insert(prices)
      .values({
        productId: product.id,
        country: "de",
        amazonPrice,
        newPrice,
        usedPrice,
        listPrice,
        priceMin,
        priceMax,
        priceAvg30,
        currency: "EUR",
        source: "keepa",
        lastUpdated: now,
      })
      .onConflictDoUpdate({
        target: [prices.productId, prices.country],
        set: {
          amazonPrice,
          newPrice,
          usedPrice,
          listPrice,
          priceMin,
          priceMax,
          priceAvg30,
          lastUpdated: now,
        },
      });

    // Add to price history
    await db.insert(priceHistory).values({
      productId: product.id,
      country: "de",
      price: bestPrice,
      currency: "EUR",
      priceType: amazonPrice !== null ? "amazon" : "new",
      recordedAt: now,
    });
  }
}

/**
 * Convert Keepa price (in cents) to decimal
 */
function keepaPriceToDecimal(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null;
  return price / 100;
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Legacy exports for compatibility
export const PRODUCT_TIERS = {
  hot: {
    name: "All Products",
    productsPerCategory: 500,
    refreshIntervalMs: SYNC_CONFIG.refreshIntervalMs,
    priority: 1,
  },
  active: {
    name: "All Products",
    productsPerCategory: 500,
    refreshIntervalMs: SYNC_CONFIG.refreshIntervalMs,
    priority: 1,
  },
  longTail: {
    name: "All Products",
    productsPerCategory: 500,
    refreshIntervalMs: SYNC_CONFIG.refreshIntervalMs,
    priority: 1,
  },
} as const;

export type ProductTier = keyof typeof PRODUCT_TIERS;

export async function syncTier(_tier: ProductTier) {
  return runDailySync();
}
