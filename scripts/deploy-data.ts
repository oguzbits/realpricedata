import { createClient } from "@libsql/client";
import { Database } from "bun:sqlite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import {
  priceHistory,
  prices,
  productOffers,
  products,
} from "../src/db/schema";
import { updateLastCloudSync } from "../src/lib/worker-state";

async function migrate() {
  console.log("🚀 Starting fresh migration...");

  const dbUrl =
    process.env.TURSO_DATABASE_URL?.replace("libsql://", "https://") || "";
  const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !dbAuthToken) {
    console.error("❌ Missing TURSO credentials.");
    process.exit(1);
  }

  const client = createClient({ url: dbUrl, authToken: dbAuthToken });
  const db = drizzle(client, {
    schema: { products, prices, productOffers, priceHistory },
  });

  console.log("📂 Opening local database...");
  const localDb = new Database("./data/cleverprices.db");

  // 1. COMPARISON (Safe Sync)
  console.log("📊 Comparing Local vs Cloud...");

  // Fetch just IDs/ASINs from cloud to compare
  const cloudAsins = await db.select({ asin: products.asin }).from(products);
  const cloudAsinSet = new Set(cloudAsins.map((p) => p.asin));

  console.log(
    `📦 Reading local data... (Cloud has ${cloudAsinSet.size} products)`,
  );
  const localProducts = localDb
    .prepare("SELECT * FROM products")
    .all() as any[];
  const localPrices = localDb.prepare("SELECT * FROM prices").all() as any[];
  const localOffers = localDb
    .prepare("SELECT * FROM product_offers")
    .all() as any[];

  // Calculate distinct counts
  let newCount = 0;
  let updateCount = 0;
  for (const p of localProducts) {
    if (cloudAsinSet.has(p.asin)) {
      updateCount++;
    } else {
      newCount++;
    }
  }

  console.log(`\n📊 Database Comparison:`);
  console.log(`   Local Products:     ${localProducts.length}`);
  console.log(`   Cloud Products:     ${cloudAsinSet.size}`);

  // Items in Cloud but NOT in Local (will remain untouched)
  const untouchedInCloud = cloudAsinSet.size - updateCount;

  console.log("\n📈 Sync Plan (Local -> Cloud):");
  console.log(`   🆕 To Insert:       ${newCount} (New in Local)`);
  console.log(`   🔄 To Update:       ${updateCount} (Common to both)`);
  console.log(`   ⏭️  Untouched:       ${untouchedInCloud} (Only in Cloud)`);

  console.log(`\n   - Prices to Sync:   ${localPrices.length}`);
  console.log(`   - Offers to Sync:   ${localOffers.length}`);
  console.log("\n🧹 Cleaning transient tables (prices/offers)...");

  // Only wipe transient data, NOT products (to preserve IDs/Refs if we needed them, though we map by slug later)
  // Actually, we map by slug later, so wiping Products is actually strictly unnecessary and risky if we ever add other relations.
  // Best practice: Upsert Products, Replace Prices.
  try {
    await db.delete(priceHistory).catch(() => {});
    await db.delete(productOffers).catch(() => {});
    await db.delete(prices).catch(() => {});
    // await db.delete(products).catch(() => {}); // <--- DO NOT WIPE PRODUCTS
  } catch (e) {
    console.warn("⚠️ Warning during cleanup:", (e as any).message);
  }

  // 3. PUSH PRODUCTS (Upsert)
  console.log(`\n☁️  Syncing ${localProducts.length} products...`);
  // Process in batches of 50
  const productBatchSize = 50;
  for (let i = 0; i < localProducts.length; i += productBatchSize) {
    const batch = localProducts.slice(i, i + productBatchSize);
    const records = batch.map((p) => ({
      asin: p.asin,
      gtin: p.gtin,
      mpn: p.mpn,
      sku: p.sku,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      category: p.category,
      imageUrl: p.image_url,
      manufacturer: p.manufacturer,
      capacity: p.capacity,
      capacityUnit: p.capacity_unit,
      normalizedCapacity: p.normalized_capacity,
      formFactor: p.form_factor,
      technology: p.technology,
      condition: p.condition,
      parentAsin: p.parent_asin,
      variationAttributes: p.variation_attributes,
      specifications: p.specifications,
      rawData: p.raw_data,
      features: p.features,
      rating: p.rating,
      reviewCount: p.review_count,
      salesRank: p.sales_rank,
      salesRankReference: p.sales_rank_reference,
      monthlySold: p.monthly_sold,
      description: p.description,
      energyLabel: p.energy_label,
      historySeeded: p.history_seeded === 1,
      updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
    }));

    try {
      await db
        .insert(products)
        .values(records)
        .onConflictDoUpdate({
          target: products.asin,
          set: {
            slug: sql`excluded.slug`, // Important: sync slug format changes
            title: sql`excluded.title`,
            category: sql`excluded.category`,
            imageUrl: sql`excluded.image_url`,
            manufacturer: sql`excluded.manufacturer`,
            parentAsin: sql`excluded.parent_asin`,
            variationAttributes: sql`excluded.variation_attributes`,
            specifications: sql`excluded.specifications`,
            rawData: sql`excluded.raw_data`,
            features: sql`excluded.features`,
            rating: sql`excluded.rating`,
            reviewCount: sql`excluded.review_count`,
            salesRank: sql`excluded.sales_rank`,
            salesRankReference: sql`excluded.sales_rank_reference`,
            monthlySold: sql`excluded.monthly_sold`,
            historySeeded: sql`excluded.history_seeded`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      // console.log(`   Processed ${i + batch.length}/${localProducts.length}...`);
    } catch (e: any) {
      console.error(`❌ Batch failed at index ${i}:`, e.message);
    }
  }

  // 4. MAP IDS by ASIN (slugs may differ between local/cloud due to format changes)
  console.log("🗺️  Mapping Cloud IDs by ASIN...");
  const cloudProducts = await db
    .select({ id: products.id, asin: products.asin })
    .from(products);
  const asinToCloudId = new Map(cloudProducts.map((p) => [p.asin, p.id]));

  // 5. PUSH PRICES
  console.log(`💰 Pushing ${localPrices.length} prices...`);
  let priceSuccess = 0;
  let priceSkippedNoProduct = 0;
  let priceSkippedNoCloudId = 0;
  const priceBatchSize = 100;

  // Debug: Check a sample of the cloud ID mapping
  console.log(`   📊 ASIN->CloudID map size: ${asinToCloudId.size}`);
  const sampleAsins = Array.from(asinToCloudId.keys()).slice(0, 3);
  console.log(`   📊 Sample ASINs: ${sampleAsins.join(", ")}`);

  for (let i = 0; i < localPrices.length; i += priceBatchSize) {
    const batch = localPrices.slice(i, i + priceBatchSize);
    const records: any[] = [];

    for (const pr of batch) {
      const localProd = localProducts.find((p) => p.id === pr.product_id);
      if (!localProd) {
        priceSkippedNoProduct++;
        continue;
      }

      // Use ASIN to find cloud ID instead of slug
      const cloudId = asinToCloudId.get(localProd.asin);
      if (!cloudId) {
        priceSkippedNoCloudId++;
        continue;
      }

      // Convert UNIX timestamp (seconds) to Date (handles both formats)
      let lastUpdatedDate: Date;
      if (typeof pr.last_updated === "number") {
        // UNIX timestamp in seconds
        lastUpdatedDate = new Date(pr.last_updated * 1000);
      } else if (typeof pr.last_updated === "string") {
        lastUpdatedDate = new Date(pr.last_updated);
      } else {
        lastUpdatedDate = new Date();
      }

      records.push({
        productId: cloudId,
        country: pr.country,
        amazonPrice: pr.amazon_price,
        amazonPriceFormatted: pr.amazon_price_formatted,
        newPrice: pr.new_price,
        usedPrice: pr.used_price,
        warehousePrice: pr.warehouse_price,
        listPrice: pr.list_price,
        priceMin: pr.price_min,
        priceMax: pr.price_max,
        priceAvg30: pr.price_avg_30,
        priceAvg90: pr.price_avg_90,
        pricePerUnit: pr.price_per_unit,
        currency: pr.currency,
        source: pr.source,
        availability: pr.availability,
        deliveryTime: pr.delivery_time,
        deliveryCost: pr.delivery_cost,
        deliveryFree: pr.delivery_free === 1,
        lastUpdated: lastUpdatedDate,
      });
    }

    if (records.length > 0) {
      try {
        await db.insert(prices).values(records);
        priceSuccess += records.length;
        // Progress indicator
        if ((i / priceBatchSize) % 10 === 0) {
          process.stdout.write(
            `\r   📦 Progress: ${priceSuccess}/${localPrices.length}...`,
          );
        }
      } catch (e: any) {
        console.error(`\n❌ Price batch failure at ${i}:`, e.message);
        // Log a sample record on first failure
        if (priceSuccess === 0 && records.length > 0) {
          console.error("   Sample record:", JSON.stringify(records[0]));
        }
      }
    }
  }
  console.log(`\n✅ Prices: ${priceSuccess}/${localPrices.length}`);
  if (priceSkippedNoProduct > 0 || priceSkippedNoCloudId > 0) {
    console.log(
      `   ⏭️  Skipped: ${priceSkippedNoProduct} (no local product), ${priceSkippedNoCloudId} (no cloud ID)`,
    );
  }

  // 6. PUSH OFFERS
  console.log(`🏷️  Pushing ${localOffers.length} offers...`);
  let offerSuccess = 0;
  const offerBatchSize = 100;

  for (let i = 0; i < localOffers.length; i += offerBatchSize) {
    const batch = localOffers.slice(i, i + offerBatchSize);
    const records: any[] = [];

    for (const off of batch) {
      const localProd = localProducts.find((p) => p.id === off.product_id);
      if (!localProd) continue;

      // Use ASIN to find cloud ID instead of slug
      const cloudId = asinToCloudId.get(localProd.asin);
      if (!cloudId) continue;

      records.push({
        productId: cloudId,
        source: off.source,
        merchantName: off.merchant_name,
        merchantLogo: off.merchant_logo,
        price: off.price,
        currency: off.currency,
        shippingCost: off.shipping_cost,
        totalPrice: off.total_price,
        affiliateUrl: off.affiliate_url,
        deepLink: off.deep_link,
        availability: off.availability,
        deliveryTime: off.delivery_time,
        merchantRating: off.merchant_rating,
        merchantReviewCount: off.merchant_review_count,
        lastUpdated: off.last_updated ? new Date(off.last_updated) : new Date(),
      });
    }

    if (records.length > 0) {
      try {
        await db.insert(productOffers).values(records);
        offerSuccess += records.length;
      } catch (e: any) {
        console.error(`❌ Offer batch failure:`, e.message);
      }
    }
  }
  console.log(`✅ Offers: ${offerSuccess}/${localOffers.length}`);

  // VERIFY
  const finalProdCount = await db
    .select({ count: sql`count(*)` })
    .from(products);
  const finalPriceCount = await db
    .select({ count: sql`count(*)` })
    .from(prices);
  console.log("🏁 Final Cloud Counts:", {
    products: finalProdCount[0].count,
    prices: finalPriceCount[0].count,
  });

  // Update worker state so the orchestrator knows sync just happened
  updateLastCloudSync();

  process.exit(0);
}

migrate().catch(console.error);
