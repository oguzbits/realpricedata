import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Affiliate Redirect Route
 * 
 * This is the ONLY route in the entire application that contains
 * direct Amazon affiliate URLs. All product CTAs link to /out/{slug}
 * which redirects to the affiliate URL stored in the Product Registry.
 */

// Inline product data to avoid import issues during build
const products = [
  {
    slug: "samsung-990-pro-2tb",
    affiliateUrl: "https://amzn.to/48yJXRZ"
  },
  {
    slug: "seagate-exos-x18-18tb",
    affiliateUrl: "https://amzn.to/4a1mQ50"
  },
  {
    slug: "wd-black-sn850x-2tb",
    affiliateUrl: "https://amzn.to/4oFAfUa"
  },
  {
    slug: "crucial-mx500-2tb",
    affiliateUrl: "https://amzn.to/4pQefqv"
  },
  {
    slug: "sandisk-extreme-portable-1tb",
    affiliateUrl: "https://amzn.to/3KGJYeO"
  }
]

export async function GET(
  request: NextRequest,
  props: { params: Promise<{slug: string}> }
) {
  const params = await props.params
  const { slug } = params

  // Look up product
  const product = products.find(p => p.slug === slug)

  if (!product) {
    // Product not found - redirect to hard drives page
    const url = new URL('/de/electronics/hard drives', request.url)
    return NextResponse.redirect(url, 307)
  }

  // Redirect to Amazon affiliate URL
  return NextResponse.redirect(product.affiliateUrl, 307)
}
