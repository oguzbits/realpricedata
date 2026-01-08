import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * Products Table
 * Core product information, updated from Keepa/PA API
 */
export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    // Identifiers
    asin: text("asin").notNull().unique(), // Amazon ASIN (primary for now)
    gtin: text("gtin"), // EAN-13 or UPC-12 for multi-source matching
    mpn: text("mpn"), // Manufacturer Part Number
    sku: text("sku"), // Internal SKU (optional)
    slug: text("slug").notNull().unique(),

    // Basic Info
    title: text("title").notNull(),
    brand: text("brand"),
    category: text("category").notNull(), // CategorySlug
    imageUrl: text("image_url"),

    // Specifications
    capacity: real("capacity"), // Numeric capacity
    capacityUnit: text("capacity_unit"), // "GB", "TB", "W"
    normalizedCapacity: real("normalized_capacity"), // Capacity in base unit (GB for storage, W for PSU)
    formFactor: text("form_factor"),
    technology: text("technology"), // "SSD", "HDD", "DDR4", "DDR5", etc.
    warranty: text("warranty"),
    condition: text("condition").default("New"), // "New", "Renewed", "Used"

    // PSU-specific
    certification: text("certification"), // "80+ Gold", etc.
    modularityType: text("modularity_type"),

    // CPU/GPU-specific (for future)
    cores: integer("cores"),
    threads: integer("threads"),
    baseClock: text("base_clock"),
    boostClock: text("boost_clock"),
    tdp: integer("tdp"),

    // Ratings
    rating: real("rating"),
    reviewCount: integer("review_count"),

    // Keepa data
    salesRank: integer("sales_rank"),
    salesRankReference: integer("sales_rank_reference"), // Category sales rank

    // Features/Description
    features: text("features"), // JSON array
    description: text("description"),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_products_category").on(table.category),
    index("idx_products_brand").on(table.brand),
    index("idx_products_asin").on(table.asin),
    index("idx_products_gtin").on(table.gtin),
  ],
);

/**
 * Prices Table
 * Current prices per product per country
 */
export const prices = sqliteTable(
  "prices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    country: text("country").notNull(), // CountryCode: "us", "de", etc.

    // Amazon prices
    amazonPrice: real("amazon_price"), // Sold by Amazon
    amazonPriceFormatted: text("amazon_price_formatted"),
    newPrice: real("new_price"), // Marketplace new
    usedPrice: real("used_price"), // Marketplace used
    warehousePrice: real("warehouse_price"), // Amazon Warehouse

    // Calculated
    pricePerUnit: real("price_per_unit"), // Price per GB/TB/W

    // Currency
    currency: text("currency").notNull(), // "USD", "EUR", etc.

    // Availability
    availability: text("availability"), // "in_stock", "out_of_stock", "unknown"

    // Source info
    source: text("source").notNull(), // "keepa", "amazon-paapi", "static"

    // Timestamps
    lastUpdated: integer("last_updated", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_prices_product_country").on(table.productId, table.country),
  ],
);

/**
 * Price History Table
 * Historical prices for charts
 */
export const priceHistory = sqliteTable(
  "price_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    country: text("country").notNull(),

    // Price at this point in time
    price: real("price").notNull(),
    currency: text("currency").notNull(),

    // Type of price
    priceType: text("price_type").notNull(), // "amazon", "new", "used", "warehouse"

    // Timestamp
    recordedAt: integer("recorded_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_price_history_product_country").on(
      table.productId,
      table.country,
    ),
    index("idx_price_history_recorded").on(table.recordedAt),
  ],
);

/**
 * Affiliate Links Table
 * Store affiliate URLs per product/country/source
 */
export const affiliateLinks = sqliteTable(
  "affiliate_links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    country: text("country").notNull(),
    source: text("source").notNull(), // "amazon", "ebay", "newegg"

    url: text("url").notNull(),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_affiliate_product_country_source").on(
      table.productId,
      table.country,
      table.source,
    ),
  ],
);

/**
 * Product Identifiers Table
 * Maps products to external source-specific IDs
 * Enables matching across Amazon, Awin, TradeTracker, etc.
 */
export const productIdentifiers = sqliteTable(
  "product_identifiers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    // Source identification
    source: text("source").notNull(), // "amazon", "awin", "tradetracker", "ebay"
    externalId: text("external_id").notNull(), // ASIN, Awin product ID, etc.
    country: text("country"), // Optional: country-specific ID

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_identifiers_source_external").on(table.source, table.externalId),
    index("idx_identifiers_product").on(table.productId),
  ],
);

/**
 * Product Offers Table
 * Multiple offers per product from different retailers
 * Enables idealo-style price comparison across merchants
 */
export const productOffers = sqliteTable(
  "product_offers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    // Source identification
    source: text("source").notNull(), // "amazon", "awin_mediamarkt", "awin_saturn", "tradetracker"
    merchantName: text("merchant_name").notNull(), // "Amazon", "MediaMarkt", "Saturn"
    merchantLogo: text("merchant_logo"), // URL to merchant logo

    // Pricing
    price: real("price").notNull(),
    currency: text("currency").notNull().default("EUR"),
    shippingCost: real("shipping_cost"),
    totalPrice: real("total_price"), // price + shipping (calculated)

    // Links
    affiliateUrl: text("affiliate_url").notNull(),
    deepLink: text("deep_link"), // Direct product page without affiliate

    // Availability
    availability: text("availability"), // "in_stock", "limited", "out_of_stock"
    deliveryTime: text("delivery_time"), // "1-2 Tage", "3-5 Werktage"

    // Merchant rating (optional, from Trustpilot etc.)
    merchantRating: real("merchant_rating"),
    merchantReviewCount: integer("merchant_review_count"),

    // Timestamps
    lastUpdated: integer("last_updated", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_offers_product").on(table.productId),
    index("idx_offers_source").on(table.source),
    index("idx_offers_price").on(table.price),
    index("idx_offers_total_price").on(table.totalPrice),
  ],
);

// Type exports for use in application
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Price = typeof prices.$inferSelect;
export type NewPrice = typeof prices.$inferInsert;
export type PriceHistoryRecord = typeof priceHistory.$inferSelect;
export type NewPriceHistoryRecord = typeof priceHistory.$inferInsert;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type NewAffiliateLink = typeof affiliateLinks.$inferInsert;
export type ProductIdentifier = typeof productIdentifiers.$inferSelect;
export type NewProductIdentifier = typeof productIdentifiers.$inferInsert;
export type ProductOffer = typeof productOffers.$inferSelect;
export type NewProductOffer = typeof productOffers.$inferInsert;
