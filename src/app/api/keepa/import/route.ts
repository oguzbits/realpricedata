/**
 * Manual Product Import Endpoint
 *
 * GET /api/keepa/import?category=hard-drives&limit=20
 *
 * Imports products from Keepa for a specific category.
 * Use this for initial data population.
 */

import type { CategorySlug } from "@/lib/categories";
import {
  discoverProducts,
  getActiveCategories,
} from "@/lib/keepa/sync-service";
import { isKeepaConfigured } from "@/lib/keepa/product-discovery";
import { checkBudget, estimateCurrentTokens } from "@/lib/keepa/token-tracker";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Check if API key is configured
  if (!isKeepaConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "KEEPA_API_KEY not configured",
      },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as CategorySlug | null;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  // Validate category
  const validCategories = getActiveCategories();
  if (category && !validCategories.includes(category)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid category: ${category}`,
        validCategories,
      },
      { status: 400 },
    );
  }

  // Check token budget
  const budget = checkBudget(limit + 10);
  if (!budget.allowed && budget.waitTimeMs > 30000) {
    return NextResponse.json(
      {
        success: false,
        error: "Bucket low. Please wait for refill.",
        waitTimeSeconds: Math.ceil(budget.waitTimeMs / 1000),
        tokensRemaining: estimateCurrentTokens(),
      },
      { status: 429 },
    );
  }

  // If no category specified, use hard-drives as default
  const targetCategory = category || ("hard-drives" as CategorySlug);

  console.log(
    `[Import] Starting import for ${targetCategory}, limit: ${limit}`,
  );

  try {
    const result = await discoverProducts(targetCategory, limit);

    return NextResponse.json({
      success: result.success,
      category: targetCategory,
      newProducts: result.newProducts,
      tokensUsed: result.tokensUsed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      tokenStatus: {
        tokensRemaining: estimateCurrentTokens(),
      },
    });
  } catch (error) {
    console.error(`[Import] Failed:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Import failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
