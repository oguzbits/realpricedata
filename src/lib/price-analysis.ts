/**
 * Price Analysis Service
 *
 * Analyzes price history data to provide "is this a good deal?" recommendations.
 * Works with self-collected history (no Keepa needed).
 */

import { eq, and, desc, gte } from "drizzle-orm";
import { db, priceHistory, prices } from "@/db";
import type { PriceAnalysis } from "@/lib/data-sources/types";
import type { CountryCode } from "@/lib/countries";

/**
 * Calculate price analysis for a product
 */
export async function analyzePriceHistory(
  productId: number,
  country: CountryCode,
  daysBack: number = 90,
): Promise<PriceAnalysis | null> {
  // Get the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Fetch price history for this product
  const history = await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.productId, productId),
        eq(priceHistory.country, country),
        eq(priceHistory.priceType, "amazon"),
        gte(priceHistory.recordedAt, cutoffDate),
      ),
    )
    .orderBy(desc(priceHistory.recordedAt));

  // Need at least 2 data points for meaningful analysis
  if (history.length < 2) {
    return null;
  }

  // Get current price
  const currentPriceRecord = await db.query.prices.findFirst({
    where: and(eq(prices.productId, productId), eq(prices.country, country)),
  });

  const currentPrice =
    currentPriceRecord?.amazonPrice ?? currentPriceRecord?.newPrice;
  if (!currentPrice) {
    return null;
  }

  // Calculate statistics
  const priceValues = history.map((h) => h.price);
  const sum = priceValues.reduce((a, b) => a + b, 0);
  const averagePrice = sum / priceValues.length;
  const lowestPrice = Math.min(...priceValues);
  const highestPrice = Math.max(...priceValues);

  // Calculate percentages
  const percentFromAverage =
    ((currentPrice - averagePrice) / averagePrice) * 100;
  const percentFromLowest = ((currentPrice - lowestPrice) / lowestPrice) * 100;

  // Determine recommendation
  let recommendation: PriceAnalysis["recommendation"];
  let recommendationText: string;

  if (percentFromLowest <= 5) {
    recommendation = "great_deal";
    recommendationText = "This is near the lowest price we've tracked!";
  } else if (percentFromAverage <= -10) {
    recommendation = "great_deal";
    recommendationText = `${Math.abs(percentFromAverage).toFixed(0)}% below average price`;
  } else if (percentFromAverage <= -5) {
    recommendation = "good_price";
    recommendationText = `${Math.abs(percentFromAverage).toFixed(0)}% below average`;
  } else if (percentFromAverage <= 5) {
    recommendation = "fair";
    recommendationText = "Price is around the average";
  } else {
    recommendation = "wait";
    recommendationText = `${percentFromAverage.toFixed(0)}% above average. Consider waiting for a drop.`;
  }

  return {
    currentPrice,
    averagePrice: Math.round(averagePrice * 100) / 100,
    lowestPrice,
    highestPrice,
    percentFromAverage: Math.round(percentFromAverage * 10) / 10,
    percentFromLowest: Math.round(percentFromLowest * 10) / 10,
    recommendation,
    recommendationText,
    daysAnalyzed:
      history.length > 0
        ? Math.ceil(
            (Date.now() -
              new Date(history[history.length - 1].recordedAt).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
  };
}

/**
 * Get price history data points for charting
 */
export async function getPriceHistoryForChart(
  productId: number,
  country: CountryCode,
  daysBack: number = 90,
): Promise<{ date: Date; price: number; priceType: string }[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const history = await db
    .select({
      date: priceHistory.recordedAt,
      price: priceHistory.price,
      priceType: priceHistory.priceType,
    })
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.productId, productId),
        eq(priceHistory.country, country),
        gte(priceHistory.recordedAt, cutoffDate),
      ),
    )
    .orderBy(priceHistory.recordedAt);

  return history.map((h) => ({
    date: new Date(h.date),
    price: h.price,
    priceType: h.priceType,
  }));
}

/**
 * Check how many days of history we have for a product
 */
export async function getHistoryCoverage(
  productId: number,
  country: CountryCode,
): Promise<{ daysOfData: number; dataPoints: number }> {
  const history = await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.productId, productId),
        eq(priceHistory.country, country),
      ),
    )
    .orderBy(priceHistory.recordedAt);

  if (history.length === 0) {
    return { daysOfData: 0, dataPoints: 0 };
  }

  const firstDate = new Date(history[0].recordedAt);
  const lastDate = new Date(history[history.length - 1].recordedAt);
  const daysOfData = Math.ceil(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    daysOfData: Math.max(1, daysOfData),
    dataPoints: history.length,
  };
}
