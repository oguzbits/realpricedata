#!/usr/bin/env bun
/**
 * Price Update Script
 *
 * Updates prices for existing products in the database.
 * Run this daily to keep prices fresh.
 *
 * Usage:
 *   bun run scripts/update-prices.ts [country]
 *
 * Examples:
 *   bun run scripts/update-prices.ts us
 *   bun run scripts/update-prices.ts de
 */

import { eq, and } from "drizzle-orm";
import {
  db,
  products,
  prices,
  priceHistory,
  NewPriceHistoryRecord,
} from "../src/db";
import {
  getProducts,
  getTokenStatus,
  isKeepaConfigured,
  KEEPA_DOMAINS,
} from "../src/lib/keepa/product-discovery";
import type { CountryCode } from "../src/lib/countries";

// Constants
const KEEPA_PRICE_TYPES = {
  AMAZON: 0,
  NEW: 1,
  USED: 2,
  WAREHOUSE: 9,
};

const DOMAIN_CURRENCIES: Record<number, string> = {
  1: "USD",
  2: "GBP",
  3: "EUR",
  4: "EUR",
  6: "CAD",
  8: "EUR",
  9: "EUR",
};

function keepaPriceToDecimal(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null;
  return price / 100;
}

/**
 * Update prices for all products
 */
async function updatePrices(country: CountryCode): Promise<void> {
  console.log(`\n💰 Updating prices for ${country.toUpperCase()}...`);

  // Get all products
  const allProducts = await db.query.products.findMany();
  if (allProducts.length === 0) {
    console.log("  No products in database.");
    return;
  }

  // Filter for stale products if requested
  const isStaleOnly = process.argv.includes("--stale");
  let targetProducts = allProducts;

  if (isStaleOnly) {
    const elevenHoursAgo = new Date(Date.now() - 11 * 60 * 60 * 1000);
    // Join with prices to check lastUpdated
    const currentPrices = await db
      .select()
      .from(prices)
      .where(eq(prices.country, country));

    targetProducts = allProducts.filter((p: any) => {
      const price = currentPrices.find((pr) => pr.productId === p.id);
      return !price || !price.lastUpdated || price.lastUpdated < elevenHoursAgo;
    });
    console.log(
      `  Targeting ${targetProducts.length} stale products (< 11h) of ${allProducts.length} total.`,
    );
  }

  if (targetProducts.length === 0) {
    console.log("  No products needing an update right now.");
    return;
  }

  // Batch ASINs (100 at a time for Keepa)
  const asins = targetProducts.map((p) => p.asin);
  const domain = KEEPA_DOMAINS[country];
  const currency = DOMAIN_CURRENCIES[domain] || "USD";

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < asins.length; i += 100) {
    const batch = asins.slice(i, i + 100);
    console.log(
      `  Fetching batch ${Math.floor(i / 100) + 1}/${Math.ceil(asins.length / 100)}...`,
    );

    try {
      const keepaProducts = await getProducts(batch, country, {
        includeHistory: false,
      });

      for (const kp of keepaProducts) {
        const product = allProducts.find((p) => p.asin === kp.asin);
        if (!product) continue;

        const currentPrices = kp.stats?.current || [];
        const amazonPrice = keepaPriceToDecimal(
          currentPrices[KEEPA_PRICE_TYPES.AMAZON],
        );
        const newPrice = keepaPriceToDecimal(
          currentPrices[KEEPA_PRICE_TYPES.NEW],
        );
        const usedPrice = keepaPriceToDecimal(
          currentPrices[KEEPA_PRICE_TYPES.USED],
        );
        const warehousePrice = keepaPriceToDecimal(
          currentPrices[KEEPA_PRICE_TYPES.WAREHOUSE],
        );

        const bestPrice = amazonPrice ?? newPrice;

        // 1. Update Product Meta (Sales Rank & Ratings)
        // Keepa salesRanks is an object mapping category ID to rank history.
        // We take the latest rank from the primary category.
        let salesRank = product.salesRank;
        if (kp.salesRanks) {
          const ranks = Object.values(kp.salesRanks)[0];
          if (ranks && ranks.length > 0) {
            salesRank = ranks[ranks.length - 1][1];
          }
        }

        // Update ratings if they changed significantly
        await db
          .update(products)
          .set({
            salesRank,
            rating:
              kp.rating && kp.rating > 0 ? kp.rating / 10 : product.rating,
            reviewCount:
              kp.reviewsLastSeenStatus !== undefined
                ? kp.reviewsLastSeenStatus
                : product.reviewCount,
            updatedAt: new Date(),
          })
          .where(eq(products.id, product.id));

        if (!bestPrice) continue;

        // Calculate price per unit
        let pricePerUnit: number | null = null;
        if (product.normalizedCapacity && product.normalizedCapacity > 0) {
          pricePerUnit = bestPrice / product.normalizedCapacity;
        }

        // Get existing price record
        const existingPrice = await db.query.prices.findFirst({
          where: (p, { and, eq }) =>
            and(eq(p.productId, product.id), eq(p.country, country)),
        });

        // Save to history if best price changed
        const oldBestPrice =
          existingPrice?.amazonPrice ?? existingPrice?.newPrice;
        if (existingPrice && oldBestPrice !== bestPrice) {
          const historyRecord: NewPriceHistoryRecord = {
            productId: product.id,
            country,
            price: bestPrice,
            currency,
            priceType: amazonPrice ? "amazon" : "new",
            recordedAt: new Date(),
          };
          await db.insert(priceHistory).values(historyRecord);
        }

        // Update or insert current price
        if (existingPrice) {
          await db
            .update(prices)
            .set({
              amazonPrice,
              newPrice,
              usedPrice,
              warehousePrice,
              pricePerUnit,
              lastUpdated: new Date(),
            })
            .where(eq(prices.id, existingPrice.id));
        } else {
          await db.insert(prices).values({
            productId: product.id,
            country,
            amazonPrice,
            newPrice,
            usedPrice,
            warehousePrice,
            pricePerUnit,
            currency,
            source: "keepa",
            lastUpdated: new Date(),
          });
        }

        updated++;
      }
    } catch (error) {
      console.error(`  Error fetching batch:`, error);
      failed += batch.length;
    }

    // Small delay between batches
    if (i + 100 < asins.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`  ✓ Updated: ${updated}, Failed: ${failed}`);
}

/**
 * Main entry point
 */
async function main() {
  console.log("🔄 CleverPrices Price Update\n");

  if (!isKeepaConfigured()) {
    console.error("❌ KEEPA_API_KEY not configured");
    process.exit(1);
  }

  const tokens = await getTokenStatus();
  console.log(`💰 Keepa tokens: ${tokens.tokensLeft} available`);

  const country = (process.argv[2] || "de") as CountryCode;
  await updatePrices(country);

  const finalTokens = await getTokenStatus();
  console.log(
    `\n✅ Update complete! Tokens remaining: ${finalTokens.tokensLeft}`,
  );
}

main().catch(console.error);
