import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, prices, priceHistory } from "@/db";
import type { CountryCode } from "@/lib/countries";

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
 * Cron job to collect price history
 * Runs daily at 6 AM UTC
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[Cron] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cron] Starting price history collection...");

  let totalRecorded = 0;
  let totalSkipped = 0;

  for (const country of SUPPORTED_COUNTRIES) {
    try {
      // Get all current prices for this country
      const currentPrices = await db
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

      for (const priceRecord of currentPrices) {
        const bestPrice = priceRecord.amazonPrice ?? priceRecord.newPrice;
        if (!bestPrice) {
          totalSkipped++;
          continue;
        }

        // Check if we already recorded today
        const existingToday = await db.query.priceHistory.findFirst({
          where: and(
            eq(priceHistory.productId, priceRecord.productId),
            eq(priceHistory.country, country),
            eq(priceHistory.priceType, "amazon"),
          ),
          orderBy: (ph, { desc }) => [desc(ph.recordedAt)],
        });

        if (existingToday) {
          const hoursSinceLastRecord =
            (Date.now() - new Date(existingToday.recordedAt).getTime()) /
            (1000 * 60 * 60);
          if (hoursSinceLastRecord < 23) {
            totalSkipped++;
            continue;
          }
        }

        // Record to history
        await db.insert(priceHistory).values({
          productId: priceRecord.productId,
          country,
          price: bestPrice,
          currency: priceRecord.currency,
          priceType: priceRecord.amazonPrice ? "amazon" : "new",
          recordedAt: new Date(),
        });

        totalRecorded++;
      }
    } catch (error) {
      console.error(`[Cron] Error for ${country}:`, error);
    }
  }

  const result = {
    success: true,
    recorded: totalRecorded,
    skipped: totalSkipped,
    timestamp: new Date().toISOString(),
  };

  console.log("[Cron] Complete:", result);
  return NextResponse.json(result);
}
