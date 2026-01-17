"use server";

import { searchProducts } from "@/lib/product-registry";
export interface LightProduct {
  asin: string;
  slug: string;
  title: string;
  image?: string;
  prices: Record<string, number>;
  category: string;
}

/**
 * Server Action for searching products from the SearchModal.
 * Optimized for frequent calls via TanStack Query.
 */
export async function performSearch(query: string): Promise<LightProduct[]> {
  if (!query || query.length < 2) return [];

  try {
    // We limit to 10 for the modal to keep the response light
    const results = await searchProducts(query, 10);

    // Strip heavy data for serialization over the wire
    // Only return what the SearchModal actually needs to render
    return results.map((p) => ({
      asin: p.asin,
      slug: p.slug,
      title: p.title,
      image: p.image,
      prices: p.prices,
      category: p.category,
    }));
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}
