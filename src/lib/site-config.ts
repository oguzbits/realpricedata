/**
 * Site-wide configuration constants
 * Centralized branding and URL configuration for easy updates
 */

// =============================================================================
// DOMAIN & URLS
// =============================================================================

/**
 * Primary domain name (without protocol)
 */
export const SITE_DOMAIN = "cleverprices.com";

/**
 * Full site URL with protocol
 */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/**
 * Site protocol
 */
export const SITE_PROTOCOL = "https";

// =============================================================================
// BRANDING
// =============================================================================

/**
 * Brand name (for display, e.g., in footers, about sections)
 */
export const BRAND_NAME = "CleverPrices";

/**
 * Brand name with domain (for titles, headers)
 */
export const BRAND_DOMAIN = "cleverprices.com";

/**
 * Site tagline/slogan
 */
export const SITE_TAGLINE = "Compare Price Per Unit";

/**
 * Full site description for SEO
 */
export const SITE_DESCRIPTION =
  "Amazon price tracker for hardware & storage. Compare HDD, SSD, and RAM by true cost per TB/GB. Find the best value hardware deals instantly.";

// =============================================================================
// CONTACT
// =============================================================================

/**
 * Contact email address
 */
export const CONTACT_EMAIL = `info@${SITE_DOMAIN}`;

// =============================================================================
// SOCIAL
// =============================================================================

/**
 * Twitter/X handle (without @)
 */
export const TWITTER_HANDLE = "cleverprices";

/**
 * Twitter/X handle with @ for display
 */
export const TWITTER_AT = `@${TWITTER_HANDLE}`;

// =============================================================================
// SEO DEFAULTS
// =============================================================================

/**
 * Default page title template
 * Usage: `${pageTitle} | ${TITLE_SUFFIX}`
 */
export const TITLE_SUFFIX = BRAND_DOMAIN;

/**
 * Default meta title for homepage
 */
export const DEFAULT_TITLE = `Amazon Unit Price Tracker & Deals | ${BRAND_DOMAIN}`;

/**
 * Title template for Next.js metadata
 */
export const TITLE_TEMPLATE = `%s | ${BRAND_DOMAIN}`;

/**
 * Author/creator name for metadata
 */
export const SITE_AUTHOR = `${BRAND_DOMAIN} Team`;

// =============================================================================
// ASSETS
// =============================================================================

/**
 * Logo paths
 */
export const LOGO = {
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  favicon: "/favicon-48x48.png",
  appleTouchIcon: "/apple-touch-icon.png",
  ogImage: "/og-image.png",
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a full URL for a given path
 */
export function getSiteUrl(path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

/**
 * Generate a URL for a specific country
 */
export function getCountryUrl(countryCode: string, path: string = ""): string {
  if (countryCode.toLowerCase() === "us") {
    return getSiteUrl(path);
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${countryCode.toLowerCase()}${normalizedPath}`;
}
