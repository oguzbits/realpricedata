"use cache";

import {
  getAllProductSlugs as getAllProductSlugsSync,
  getAllProducts as getAllProductsSync,
  getBestDeals as getBestDealsSync,
  getDiverseMostPopular as getDiverseMostPopularSync,
  getMostPopular as getMostPopularSync,
  getNewArrivals as getNewArrivalsSync,
  type Product,
} from "../product-registry";
import { cacheLife } from "next/cache";

/**
 * Cached server-side wrappers for product registry functions
 * These are used in Server Components to benefit from Next.js 16 caching
 */

export async function getAllProductSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return getAllProductSlugsSync();
}

// Bypass cache for large registry calls to avoid string limit issues during build
export async function getAllProducts(): Promise<Product[]> {
  return getAllProductsSync();
}

export async function getBestDeals(
  limit: number = 8,
  countryCode: string = "de",
  condition?: "New" | "Used" | "Renewed",
): Promise<Product[]> {
  cacheLife("prices");
  return getBestDealsSync(limit, countryCode, condition);
}

export async function getMostPopular(
  limit: number = 8,
  countryCode: string = "de",
  condition?: "New" | "Used" | "Renewed",
): Promise<Product[]> {
  cacheLife("prices");
  return getMostPopularSync(limit, countryCode, condition);
}

export async function getNewArrivals(
  limit: number = 8,
  countryCode: string = "de",
  condition?: "New" | "Used" | "Renewed",
): Promise<Product[]> {
  cacheLife("prices");
  return getNewArrivalsSync(limit, countryCode, condition);
}

export async function getDiverseMostPopular(
  itemsPerCategory: number = 10,
  countryCode: string = "de",
): Promise<Product[]> {
  cacheLife("prices");
  return getDiverseMostPopularSync(itemsPerCategory, countryCode);
}
