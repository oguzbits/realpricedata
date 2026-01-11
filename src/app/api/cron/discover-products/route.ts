/**
 * Product Discovery Cron Job
 *
 * Endpoint: /api/cron/discover-products
 * Schedule: Weekly (Sunday at 2 AM)
 *
 * Discovers new popular products from Keepa for all categories.
 */

import type { CategorySlug } from "@/lib/categories";
import {
  discoverProducts,
  getActiveCategories,
} from "@/lib/keepa/sync-service";
import { getTokenStatus, hasTokenBudget } from "@/lib/keepa/token-tracker";
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

  // Get optional category filter from query params
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category") as CategorySlug | null;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  // Check token budget
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

  console.log("[Cron] Starting product discovery");

  // Get categories to process
  const categories = categoryParam
    ? [categoryParam]
    : getActiveCategories().slice(0, 5); // Limit categories per run

  const results: Record<
    string,
    { newProducts: number; tokensUsed: number; errors: string[] }
  > = {};
  let totalNewProducts = 0;
  let totalTokensUsed = 0;
  const allErrors: string[] = [];

  for (const category of categories) {
    // Check budget before each category
    if (!hasTokenBudget(limit + 10)) {
      console.log(`[Cron] Stopping discovery - token budget low`);
      break;
    }

    try {
      const result = await discoverProducts(category, limit);
      results[category] = {
        newProducts: result.newProducts,
        tokensUsed: result.tokensUsed,
        errors: result.errors,
      };
      totalNewProducts += result.newProducts;
      totalTokensUsed += result.tokensUsed;
      allErrors.push(...result.errors);
    } catch (error) {
      const errorMsg = `${category}: ${error instanceof Error ? error.message : "Unknown error"}`;
      allErrors.push(errorMsg);
      results[category] = { newProducts: 0, tokensUsed: 0, errors: [errorMsg] };
    }

    // Small delay between categories to be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return NextResponse.json({
    success: allErrors.length === 0,
    categoriesProcessed: Object.keys(results).length,
    totalNewProducts,
    totalTokensUsed,
    results,
    errors: allErrors.length > 0 ? allErrors : undefined,
    tokenStatus: {
      tokensUsedToday: getTokenStatus().tokensUsedToday,
      tokensRemaining: getTokenStatus().tokensRemaining,
    },
  });
}

// Support POST for manual triggers
export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request);
}
