/**
 * Daily Sync Cron Job
 *
 * Endpoint: /api/cron/sync-products
 * Schedule: Twice daily (6 AM and 6 PM)
 *
 * Updates all products that haven't been refreshed in 24 hours.
 */

import { runDailySync, getProductCount } from "@/lib/keepa/sync-service";
import { getTokenStatus } from "@/lib/keepa/token-tracker";
import { NextRequest, NextResponse } from "next/server";

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check token budget before starting
  const tokenStatus = getTokenStatus();
  if (!tokenStatus.canProceed) {
    return NextResponse.json(
      {
        error: "Token budget exhausted",
        tokensUsedToday: tokenStatus.tokensUsedToday,
        percentUsed: Math.round(tokenStatus.percentUsed * 100),
      },
      { status: 429 },
    );
  }

  const productCount = await getProductCount();
  console.log(`[Cron] Starting daily sync for ${productCount} products`);

  try {
    const result = await runDailySync();

    return NextResponse.json({
      success: result.success,
      totalProducts: productCount,
      productsUpdated: result.productsUpdated,
      tokensUsed: result.tokensUsed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      tokenStatus: {
        tokensUsedToday: getTokenStatus().tokensUsedToday,
        tokensRemaining: getTokenStatus().tokensRemaining,
      },
    });
  } catch (error) {
    console.error(`[Cron] Sync failed:`, error);
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Support POST for manual triggers
export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request);
}
