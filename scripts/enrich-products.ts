import { db, products, prices } from "../src/db";
import { eq, isNull, and, or, asc } from "drizzle-orm";
import {
  getProducts,
  getTokenStatus,
} from "../src/lib/keepa/product-discovery";

async function enrich() {
  console.log("💎 CleverPrices Product Enrichment");
  console.log("Seeding historical data for existing products...\n");

  // 1. Get products that haven't been seeded yet
  // We prioritize by sales rank (lowest rank = most popular)
  const candidates = await db.query.products.findMany({
    where: or(
      eq(products.historySeeded, false),
      isNull(products.historySeeded),
    ),
    orderBy: [asc(products.salesRank)],
    limit: 500, // Process in chunks
  });

  if (candidates.length === 0) {
    console.log("✅ All products are already enriched!");
    return;
  }

  console.log(`🔍 Found ${candidates.length} candidates for enrichment.`);

  let seeded = 0;
  const asins = candidates.map((p) => p.asin);

  // 2. Fetch from Keepa with history enabled (costs ~1-5 tokens per product)
  for (let i = 0; i < asins.length; i += 20) {
    // Small batches to manage tokens
    const batch = asins.slice(i, i + 20);
    const tokens = await getTokenStatus();

    if (tokens.tokensLeft < 100) {
      console.log("⏳ Low tokens, pausing enrichment...");
      break;
    }

    console.log(
      `📦 Seeding batch ${Math.floor(i / 20) + 1}/${Math.ceil(asins.length / 20)}...`,
    );

    try {
      const enrichedProducts = await getProducts(batch, "de", {
        includeHistory: true,
      });

      for (const ep of enrichedProducts) {
        const localProduct = candidates.find((p) => p.asin === ep.asin);
        if (!localProduct) continue;

        // Update avg90 in prices table
        const avg90Raw = ep.stats?.avg90?.[1]; // 1 = New price
        const priceAvg90 = avg90Raw && avg90Raw > 0 ? avg90Raw / 100 : null;

        if (priceAvg90) {
          await db
            .update(prices)
            .set({ priceAvg90 })
            .where(
              and(
                eq(prices.productId, localProduct.id),
                eq(prices.country, "de"),
              ),
            );
        }

        // Mark as seeded
        await db
          .update(products)
          .set({
            historySeeded: true,
            // Update sales rank while we are at it
            salesRank: ep.salesRanks
              ? Object.values(ep.salesRanks)[0]?.[
                  Object.values(ep.salesRanks)[0]?.length - 1
                ]?.[1]
              : localProduct.salesRank,
            updatedAt: new Date(),
          })
          .where(eq(products.id, localProduct.id));

        seeded++;
      }
    } catch (e: any) {
      console.error("  Error in batch:", e.message);
    }
  }

  console.log(`\n✅ Enrichment cycle complete. Seeded ${seeded} products.`);
}

enrich().catch(console.error);
