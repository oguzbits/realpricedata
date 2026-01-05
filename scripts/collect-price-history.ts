#!/usr/bin/env bun
/**
 * Collect Price History
 *
 * Records current prices to the price_history table.
 * Run this daily (via cron or manually) to build historical data.
 *
 * Over time, this builds up price charts without needing Keepa.
 *
 * Usage:
 *   bun run scripts/collect-price-history.ts [country]
 *
 * Examples:
 *   bun run scripts/collect-price-history.ts us
 *   bun run scripts/collect-price-history.ts de
 *   bun run scripts/collect-price-history.ts all
 */

import { eq, and } from "drizzle-orm";
import {
  db,
  products,
  prices,
  priceHistory,
  NewPriceHistoryRecord,
} from "../src/db";
import type { CountryCode } from "../src/lib/countries";

const SUPPORTED_COUNTRIES: CountryCode[] = [
  "us",
  "de",
  "uk",
  "ca",
  "fr",
  "it",
  "es",
];

/**
 * Record prices to history for a specific country
 */
async function collectHistoryForCountry(
  country: CountryCode,
): Promise<{ recorded: number; skipped: number }> {
  console.log(`\n📊 Collecting price history for ${country.toUpperCase()}...`);

  // Get all products with prices for this country
  const allPrices = await db.query.prices.findMany({
    where: eq(prices.country, country),
    with: {
      // We need the product relation - but since we haven't set up relations,
      // we'll do a manual join approach
    },
  });

  // For now, get prices directly
  const pricesWithProducts = await db
    .select({
      productId: prices.productId,
      country: prices.country,
      amazonPrice: prices.amazonPrice,
      newPrice: prices.newPrice,
      usedPrice: prices.usedPrice,
      warehousePrice: prices.warehousePrice,
      currency: prices.currency,
    })
    .from(prices)
    .where(eq(prices.country, country));

  let recorded = 0;
  let skipped = 0;

  for (const priceRecord of pricesWithProducts) {
    // Get the best available price
    const bestPrice = priceRecord.amazonPrice ?? priceRecord.newPrice;

    if (!bestPrice) {
      skipped++;
      continue;
    }

    // Check if we already have a record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await db.query.priceHistory.findFirst({
      where: and(
        eq(priceHistory.productId, priceRecord.productId),
        eq(priceHistory.country, country),
        eq(priceHistory.priceType, "amazon"),
      ),
      orderBy: (ph, { desc }) => [desc(ph.recordedAt)],
    });

    // Skip if we already recorded today (within 23 hours)
    if (existingToday) {
      const lastRecorded = new Date(existingToday.recordedAt);
      const hoursSinceLastRecord =
        (Date.now() - lastRecorded.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastRecord < 23) {
        skipped++;
        continue;
      }
    }

    // Record Amazon/New price
    const historyRecord: NewPriceHistoryRecord = {
      productId: priceRecord.productId,
      country,
      price: bestPrice,
      currency: priceRecord.currency,
      priceType: priceRecord.amazonPrice ? "amazon" : "new",
      recordedAt: new Date(),
    };

    await db.insert(priceHistory).values(historyRecord);
    recorded++;

    // Also record used price if available
    if (priceRecord.usedPrice) {
      await db.insert(priceHistory).values({
        ...historyRecord,
        price: priceRecord.usedPrice,
        priceType: "used",
      });
    }

    // Also record warehouse price if available
    if (priceRecord.warehousePrice) {
      await db.insert(priceHistory).values({
        ...historyRecord,
        price: priceRecord.warehousePrice,
        priceType: "warehouse",
      });
    }
  }

  console.log(`  ✓ Recorded: ${recorded}, Skipped: ${skipped}`);
  return { recorded, skipped };
}

/**
 * Get price history statistics
 */
async function getHistoryStats(): Promise<void> {
  const totalRecords = await db.select().from(priceHistory);
  const totalProducts = await db.select().from(products);

  // Get date range
  const oldest = await db.query.priceHistory.findFirst({
    orderBy: (ph, { asc }) => [asc(ph.recordedAt)],
  });

  const newest = await db.query.priceHistory.findFirst({
    orderBy: (ph, { desc }) => [desc(ph.recordedAt)],
  });

  console.log(`\n📈 Price History Statistics:`);
  console.log(`   Total records:  ${totalRecords.length}`);
  console.log(`   Total products: ${totalProducts.length}`);

  if (oldest && newest) {
    const oldestDate = new Date(oldest.recordedAt).toLocaleDateString();
    const newestDate = new Date(newest.recordedAt).toLocaleDateString();
    console.log(`   Date range:     ${oldestDate} → ${newestDate}`);

    const daysCovered = Math.ceil(
      (new Date(newest.recordedAt).getTime() -
        new Date(oldest.recordedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    console.log(`   Days covered:   ${daysCovered}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log("📊 CleverPrices Price History Collection\n");

  const countryArg = process.argv[2] || "all";

  if (countryArg === "all") {
    // Collect for all supported countries
    let totalRecorded = 0;
    let totalSkipped = 0;

    for (const country of SUPPORTED_COUNTRIES) {
      try {
        const { recorded, skipped } = await collectHistoryForCountry(country);
        totalRecorded += recorded;
        totalSkipped += skipped;
      } catch (error) {
        console.error(`  Error for ${country}:`, error);
      }
    }

    console.log(
      `\n📊 Total: ${totalRecorded} recorded, ${totalSkipped} skipped`,
    );
  } else {
    const country = countryArg.toLowerCase() as CountryCode;
    if (!SUPPORTED_COUNTRIES.includes(country)) {
      console.error(`❌ Unknown country: ${countryArg}`);
      console.log(`   Supported: ${SUPPORTED_COUNTRIES.join(", ")}`);
      process.exit(1);
    }
    await collectHistoryForCountry(country);
  }

  // Show stats
  await getHistoryStats();

  console.log("\n✅ Done! Run this script daily to build price history.");
}

main().catch(console.error);
