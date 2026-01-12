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
  const productsPerCategoryParam = searchParams.get("productsPerCategory");
  const productsPerCategory = productsPerCategoryParam
    ? parseInt(productsPerCategoryParam, 10)
    : 50;

  const categories = getActiveCategories();
  const estimatedTokens = categories.length * (productsPerCategory + 10);

  // Check token budget
  const budget = checkBudget(50); // Start with a small check to ensure bucket isn't totally dry
  if (!budget.allowed && budget.waitTimeMs > 60000) {
    return NextResponse.json(
      {
        success: false,
        error: "Bucket empty. Please wait for refill.",
        waitTimeSeconds: Math.ceil(budget.waitTimeMs / 1000),
        tokensRemaining: estimateCurrentTokens(),
        suggestion: `The system uses a leaky bucket (20/min). Wait a few minutes or reduce limit.`,
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
        tokensRemaining: estimateCurrentTokens(),
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
