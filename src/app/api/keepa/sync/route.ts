/**
 * Daily Sync Endpoint
 *
 * GET /api/keepa/sync
 *
 * Updates existing products that are older than 24 hours.
 * Uses direct ASIN lookup (cheap) instead of search (expensive).
 * secure this endpoint with a secret key in production!
 */

import { runDailySync } from "@/lib/keepa/sync-service";
import { getTokenStatus } from "@/lib/keepa/token-tracker";
import { NextResponse } from "next/server";

export const maxDuration = 300; // Allow 5 minutes for sync

export async function GET(): Promise<NextResponse> {
  console.log("[API] Starting daily sync...");

  try {
    const result = await runDailySync();

    return NextResponse.json({
      success: result.success,
      productsUpdated: result.productsUpdated,
      tokensUsed: result.tokensUsed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      tokenStatus: {
        tokensUsedToday: getTokenStatus().tokensUsedToday,
        tokensRemaining: getTokenStatus().tokensRemaining,
      },
    });
  } catch (error) {
    console.error("[API] Sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sync failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
