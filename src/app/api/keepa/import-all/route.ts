/**
 * Bulk Import Endpoint
 *
 * GET /api/keepa/import-all?productsPerCategory=50
 *
 * Imports products from ALL categories at once.
 * Use this for initial database population.
 */

import {
  importAllCategories,
  getActiveCategories,
  getProductCount,
} from "@/lib/keepa/sync-service";
import { isKeepaConfigured } from "@/lib/keepa/product-discovery";
import { getTokenStatus, hasTokenBudget } from "@/lib/keepa/token-tracker";
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
  const productsPerCategoryParam = searchParams.get("productsPerCategory");
  const productsPerCategory = productsPerCategoryParam
    ? parseInt(productsPerCategoryParam, 10)
    : 50;

  const categories = getActiveCategories();
  const estimatedTokens = categories.length * (productsPerCategory + 10);

  // Check token budget
  if (!hasTokenBudget(estimatedTokens)) {
    const status = getTokenStatus();
    return NextResponse.json(
      {
        success: false,
        error: "Insufficient token budget for full import",
        estimatedTokensNeeded: estimatedTokens,
        tokensRemaining: status.tokensRemaining,
        suggestion: `Reduce productsPerCategory or run import over multiple days`,
      },
      { status: 429 },
    );
  }

  const currentProducts = await getProductCount();
  console.log(
    `[Import All] Starting import: ${categories.length} categories × ${productsPerCategory} products`,
  );

  try {
    const result = await importAllCategories(productsPerCategory);

    const newProductCount = await getProductCount();

    return NextResponse.json({
      success: result.success,
      previousProductCount: currentProducts,
      newProductCount,
      totalNewProducts: result.totalProducts,
      tokensUsed: result.tokensUsed,
      categories: result.categories,
      errors: result.errors.length > 0 ? result.errors : undefined,
      tokenStatus: {
        tokensUsedToday: getTokenStatus().tokensUsedToday,
        tokensRemaining: getTokenStatus().tokensRemaining,
      },
    });
  } catch (error) {
    console.error(`[Import All] Failed:`, error);
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
