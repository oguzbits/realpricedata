"use server";

import { searchProducts } from "@/lib/product-registry";
import { type Product } from "@/lib/product-registry";

/**
 * Server Action for searching products from the SearchModal.
 * Optimized for frequent calls via TanStack Query.
 */
export async function performSearch(query: string): Promise<Product[]> {
  if (!query || query.length < 2) return [];

  try {
    // We limit to 10 for the modal to keep the response light
    const results = await searchProducts(query, 10);

    // Strip heavy data for serialization over the wire
    return results.map((p) => ({
      ...p,
      specifications: {},
      features: [],
      priceHistory: [],
    }));
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}
