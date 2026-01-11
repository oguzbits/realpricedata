/**
 * Keepa API Test Endpoint
 *
 * GET /api/keepa/test
 *
 * Verifies Keepa API connection and token status.
 * Use this to test before running full sync.
 */

import { NextResponse } from "next/server";
import {
  getTokenStatus as getKeepaTokenStatus,
  isKeepaConfigured,
  getProducts,
} from "@/lib/keepa/product-discovery";
import { getTokenStatus as getLocalTokenStatus } from "@/lib/keepa/token-tracker";

export async function GET(): Promise<NextResponse> {
  // Check if API key is configured
  if (!isKeepaConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "KEEPA_API_KEY not configured",
        hint: "Add KEEPA_API_KEY to your .env.local file",
      },
      { status: 400 },
    );
  }

  try {
    // Check token status from Keepa API
    const keepaTokenInfo = await getKeepaTokenStatus();
    const localStatus = getLocalTokenStatus();

    // Test fetch with a known German product (Samsung 990 Pro)
    const testAsin = "B0BHK1VPK8";
    let testProduct = null;

    try {
      const products = await getProducts([testAsin], "de");
      if (products.length > 0) {
        testProduct = {
          asin: products[0].asin,
          title: products[0].title,
          brand: products[0].brand,
          hasPrice: !!(
            products[0].stats?.current?.[0] || products[0].stats?.current?.[1]
          ),
        };
      }
    } catch (error) {
      // Test fetch failed, but connection might still be valid
      testProduct = { error: String(error) };
    }

    return NextResponse.json({
      success: true,
      connection: "OK",
      keepaStatus: {
        tokensLeft: keepaTokenInfo.tokensLeft,
        refillRate: keepaTokenInfo.refillRate,
      },
      localTracking: {
        tokensUsedToday: localStatus.tokensUsedToday,
        tokensRemaining: localStatus.tokensRemaining,
        percentUsed: Math.round(localStatus.percentUsed * 100) + "%",
      },
      testProduct,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Keepa API connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
