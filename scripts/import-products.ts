#!/usr/bin/env bun
/**
 * Product Import Script
 *
 * Discovers and imports products from Keepa into the database.
 *
 * Usage:
 *   bun run scripts/import-products.ts [category] [country]
 *
 * Examples:
 *   bun run scripts/import-products.ts hard-drives us
 *   bun run scripts/import-products.ts ram de
 *   bun run scripts/import-products.ts all us
 */

import { eq } from "drizzle-orm";
import { db, products, prices, NewProduct, NewPrice } from "../src/db";
import {
  discoverProducts,
  getTokenStatus,
  isKeepaConfigured,
  KEEPA_DOMAINS,
  type KeepaProductRaw,
} from "../src/lib/keepa/product-discovery";
import type { CountryCode } from "../src/lib/countries";

// Currency mapping
const DOMAIN_CURRENCIES: Record<number, string> = {
  1: "USD",
  2: "GBP",
  3: "EUR",
  4: "EUR",
  6: "CAD",
  8: "EUR",
  9: "EUR",
};

// Keepa price type indices
const KEEPA_PRICE_TYPES = {
  AMAZON: 0,
  NEW: 1,
  USED: 2,
  SALES_RANK: 3,
  WAREHOUSE: 9,
  RATING: 16,
  REVIEW_COUNT: 17,
};

/**
 * Quality filtering rules for different categories
 */
const QUALITY_RULES: Record<
  string,
  { minPrice?: number; excludeKeywords: string[] }
> = {
  gpu: {
    minPrice: 80,
    excludeKeywords: [
      "halterung",
      "stütze",
      "riser",
      "kabel",
      "adapter",
      "backplate",
      "anti-sag",
      "vertikal",
      "bridge",
      "bracket",
    ],
  },
  cpu: {
    minPrice: 50,
    excludeKeywords: ["wärmeleitpaste", "kühler", "lüfter", "fan", "thermal"],
  },
  smartphones: {
    minPrice: 60,
    excludeKeywords: ["hülle", "panzerglas", "folie", "schutzfolie", "dummy"],
  },
  notebooks: {
    minPrice: 150,
    excludeKeywords: ["tastaturschutz", "folie", "aufkleber", "tasche"],
  },
  tablets: {
    minPrice: 80,
    excludeKeywords: ["hülle", "stilus", "stift", "pen", "folie"],
  },
  ssds: {
    minPrice: 15,
    excludeKeywords: ["gehäuse", "adapter", "kühler", "heatsink"],
  },
  ram: { minPrice: 15, excludeKeywords: ["kühler", "heatsink", "dummy"] },
  motherboards: { minPrice: 50, excludeKeywords: ["blende", "kabel"] },
  monitors: { minPrice: 70, excludeKeywords: ["arm", "halter", "adapter"] },
  tvs: { minPrice: 150, excludeKeywords: ["halter", "wandhalterung"] },
  staubsauger: {
    minPrice: 50,
    excludeKeywords: ["beutel", "filter", "ersatz"],
  },
  headphones: {
    minPrice: 15,
    excludeKeywords: ["ohrpolster", "case", "ständer"],
  },
  "hard-drives": {
    minPrice: 30,
    excludeKeywords: [
      "ssd",
      "gehäuse",
      "adapter",
      "kabel",
      "rahmen",
      "einbaurahmen",
      "schutzhülle",
      "case",
    ],
  },
  "gaming-elektrospielzeug": {
    minPrice: 30,
    excludeKeywords: [
      "uno",
      "schminke",
      "schmink",
      "kartenspiel",
      "makeup",
      "bauplatte",
    ],
  },
  speicherkarten: {
    minPrice: 10,
    excludeKeywords: [
      "batterie",
      "knopfzelle",
      "battery",
      "coin",
      "akku",
      "adapter",
    ],
  },
  espressomaschinen: {
    minPrice: 100,
    excludeKeywords: ["ventil", "reiniger", "filter", "dichtung", "entkalker"],
  },
  elektrowerkzeuge: {
    minPrice: 40,
    excludeKeywords: [
      "akku",
      "bit",
      "bohrer",
      "klingen",
      "scheibe",
      "schleifpapier",
    ],
  },
};

const GLOBAL_EXCLUDE_KEYWORDS = [
  "adapter",
  "kabel",
  "cable",
  "stecker",
  "tasse",
  "poster",
  "sticker",
  "aufkleber",
  "batterie",
  "knopfzelle",
  "battery",
  "coin",
  "ersatzteil",
  "zubehör",
  "reiniger",
  "tasche",
];

/**
 * Check if a product meets quality standards for its category
 */
function isQualityProduct(
  title: string,
  price: number,
  category: string,
): boolean {
  const lowercaseTitle = title.toLowerCase();

  // 1. Strong Accessory Terms (usually skip regardless of price, if they are the main subject)
  // We use word boundaries simulation where possible
  const strongAccessoryTerms = [
    "halterung",
    "stütze",
    "riser",
    "anti-sag",
    "mount",
    "bracket",
    "dummy",
    "wandhalterung",
    "einbaurahmen",
  ];

  for (const kw of strongAccessoryTerms) {
    if (lowercaseTitle.includes(kw)) return false;
  }

  // 2. High Price Protection: If it's a real expensive item, we are generally lenient.
  if (price > 150) {
    // We STILL respect category-specific exclusions for expensive items
    // (e.g., a 200€ "SSD Docking Station" should not be in "hard-drives")
    const rule = QUALITY_RULES[category];
    if (rule?.excludeKeywords) {
      for (const kw of rule.excludeKeywords) {
        if (lowercaseTitle.includes(kw)) return false;
      }
    }

    if (lowercaseTitle.includes("hülle") || lowercaseTitle.includes("dummy"))
      return false;
    return true;
  }

  // 3. Global Term Check (more restrictive for cheaper items)
  for (const kw of GLOBAL_EXCLUDE_KEYWORDS) {
    // Use word boundaries or specific checks to avoid matching "Ladekabel" or "Netzkabel"
    // If it is JUST a "kabel" or "adapter" it usually has it as a primary word.
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(title)) return false;
  }

  // 4. Category specific rules
  const rule = QUALITY_RULES[category];
  if (rule) {
    if (rule.minPrice && price < rule.minPrice) return false;
    for (const kw of rule.excludeKeywords) {
      if (lowercaseTitle.includes(kw)) return false;
    }
  }

  // 5. Catch-all: very cheap items in tech categories are usually accessories
  if (price < 5 && !["speicherkarten"].includes(category)) return false;

  return true;
}

/**
 * Convert Keepa price (in cents) to decimal
 */
function keepaPriceToDecimal(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null;
  return price / 100;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(asin: string, title?: string): string {
  if (!title) return asin.toLowerCase();

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${slug}-${asin.toLowerCase()}`;
}

/**
 * Extract product specifications from title/features
 */
function extractSpecs(product: KeepaProductRaw): {
  capacity?: number;
  capacityUnit?: "GB" | "TB" | "W";
  technology?: string;
  formFactor?: string;
  energyLabel?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
} {
  const title = product.title?.toLowerCase() || "";
  const features = (product.features || []).join(" ").toLowerCase();
  const text = `${title} ${features}`;

  let capacity: number | undefined;
  let capacityUnit: "GB" | "TB" | "W" | undefined;
  let technology: string | undefined;
  let formFactor: string | undefined;

  // Storage capacity (TB/GB)
  const tbMatch = text.match(/(\d+)\s*tb/);
  const gbMatch = text.match(/(\d+)\s*gb/);
  if (tbMatch) {
    capacity = parseInt(tbMatch[1], 10);
    capacityUnit = "TB";
  } else if (gbMatch) {
    capacity = parseInt(gbMatch[1], 10);
    capacityUnit = "GB";
  }

  // PSU wattage
  const wattMatch = text.match(/(\d+)\s*w(?:att)?/);
  if (wattMatch && (text.includes("power") || text.includes("psu"))) {
    capacity = parseInt(wattMatch[1], 10);
    capacityUnit = "W";
  }

  // Technology
  if (text.includes("nvme")) technology = "NVMe SSD";
  else if (text.includes("sata") && text.includes("ssd"))
    technology = "SATA SSD";
  else if (text.includes("ssd")) technology = "SSD";
  else if (text.includes("hdd") || text.includes("hard drive"))
    technology = "HDD";
  else if (text.includes("ddr5")) technology = "DDR5";
  else if (text.includes("ddr4")) technology = "DDR4";

  // Form factor
  if (text.includes("m.2") || text.includes("m2")) formFactor = "M.2";
  else if (text.includes("2.5")) formFactor = '2.5"';
  else if (text.includes("3.5")) formFactor = '3.5"';
  else if (text.includes("so-dimm") || text.includes("sodimm"))
    formFactor = "SO-DIMM";
  else if (text.includes("dimm")) formFactor = "DIMM";

  // Energy label (A-G)
  let energyLabel: "A" | "B" | "C" | "D" | "E" | "F" | "G" | undefined;
  const energyMatch = text.match(/energieeffizienzklasse\s*([a-g])/i);
  if (energyMatch) {
    energyLabel = energyMatch[1].toUpperCase() as any;
  } else if (text.includes("effizienzklasse a")) energyLabel = "A";
  else if (text.includes("effizienzklasse b")) energyLabel = "B";
  else if (text.includes("effizienzklasse c")) energyLabel = "C";
  else if (text.includes("effizienzklasse d")) energyLabel = "D";
  else if (text.includes("effizienzklasse e")) energyLabel = "E";
  else if (text.includes("effizienzklasse f")) energyLabel = "F";
  else if (text.includes("effizienzklasse g")) energyLabel = "G";

  return {
    capacity,
    capacityUnit,
    technology,
    formFactor,
    energyLabel,
  };
}

/**
 * Import a single product into the database
 */
async function importProduct(
  raw: KeepaProductRaw,
  category: string,
  country: CountryCode,
): Promise<"inserted" | "updated" | "skipped"> {
  try {
    const domain = KEEPA_DOMAINS[country];
    const currency = DOMAIN_CURRENCIES[domain] || "USD";
    const specs = extractSpecs(raw);

    // Get current prices
    const currentPrices = raw.stats?.current || [];
    const amazonPrice = keepaPriceToDecimal(
      currentPrices[KEEPA_PRICE_TYPES.AMAZON],
    );
    const newPrice = keepaPriceToDecimal(currentPrices[KEEPA_PRICE_TYPES.NEW]);
    const usedPrice = keepaPriceToDecimal(
      currentPrices[KEEPA_PRICE_TYPES.USED],
    );
    const warehousePrice = keepaPriceToDecimal(
      currentPrices[KEEPA_PRICE_TYPES.WAREHOUSE],
    );

    // Get 90-day average
    const priceAvg90 = raw.stats?.avg90
      ? keepaPriceToDecimal(raw.stats.avg90[KEEPA_PRICE_TYPES.NEW])
      : null;

    const bestPrice = amazonPrice ?? newPrice;
    if (!bestPrice) {
      // console.log(`  [Skip] ${raw.asin}: No price available`);
      return "skipped";
    }

    // Quality check: Filter out accessories and low-quality items
    if (!isQualityProduct(raw.title || "", bestPrice, category)) {
      // console.log(`  [Quality Skip] ${raw.asin}: ${raw.title}`);
      return "skipped";
    }

    // Calculate price per unit
    let pricePerUnit: number | null = null;
    if (specs.capacity && specs.capacity > 0) {
      let normalizedCapacity = specs.capacity;
      if (specs.capacityUnit === "TB") {
        normalizedCapacity = specs.capacity * 1000; // Convert to GB
      }
      pricePerUnit = bestPrice / normalizedCapacity;
    }

    // Get image URL
    let imageUrl: string | undefined;
    if (raw.imagesCSV) {
      const firstImage = raw.imagesCSV.split(",")[0];
      if (firstImage) {
        imageUrl = `https://m.media-amazon.com/images/I/${firstImage}`;
      }
    }

    // Get rating
    const rating =
      keepaPriceToDecimal(currentPrices[KEEPA_PRICE_TYPES.RATING]) || undefined;
    const reviewCount =
      currentPrices[KEEPA_PRICE_TYPES.REVIEW_COUNT] ?? undefined;

    // Prepare product data
    const productData: NewProduct = {
      asin: raw.asin,
      slug: generateSlug(raw.asin, raw.title),
      title: raw.title || raw.asin,
      brand: raw.brand || undefined,
      category,
      imageUrl,
      capacity: specs.capacity,
      capacityUnit: specs.capacityUnit,
      normalizedCapacity:
        specs.capacityUnit === "TB"
          ? (specs.capacity || 0) * 1000
          : specs.capacity,
      technology: specs.technology,
      formFactor: specs.formFactor,
      rating,
      reviewCount: reviewCount && reviewCount > 0 ? reviewCount : undefined,
      energyLabel: specs.energyLabel,
      features: raw.features ? JSON.stringify(raw.features) : undefined,
      description: raw.description,
      salesRank: ((raw.salesRanks &&
      Object.values(raw.salesRanks)[0]?.length > 0
        ? Object.values(raw.salesRanks)[0][
            Object.values(raw.salesRanks)[0].length - 1
          ]
        : undefined) || raw.stats?.current?.[KEEPA_PRICE_TYPES.SALES_RANK]) as
        | number
        | undefined,
      historySeeded: !!raw.stats,
    };

    // Upsert product
    const existing = await db.query.products.findFirst({
      where: eq(products.asin, raw.asin),
    });

    let productId: number;
    let status: "inserted" | "updated" = "inserted";

    if (existing) {
      await db
        .update(products)
        .set(productData)
        .where(eq(products.id, existing.id));
      productId = existing.id;
      status = "updated";
    } else {
      const result = await db
        .insert(products)
        .values(productData)
        .returning({ id: products.id });
      productId = result[0].id;
      status = "inserted";
    }

    // Upsert price
    const priceData: NewPrice = {
      productId,
      country,
      amazonPrice,
      newPrice,
      usedPrice,
      warehousePrice,
      priceAvg90,
      pricePerUnit,
      currency,
      source: "keepa",
      lastUpdated: new Date(),
    };

    const existingPrice = await db.query.prices.findFirst({
      where: (p, { and, eq }) =>
        and(eq(p.productId, productId), eq(p.country, country)),
    });

    if (existingPrice) {
      await db
        .update(prices)
        .set(priceData)
        .where(eq(prices.id, existingPrice.id));
    } else {
      await db.insert(prices).values(priceData);
    }

    return status;
  } catch (error) {
    console.error(`  [Error] ${raw.asin}:`, error);
    return "skipped";
  }
}

/**
 * Import all products for a category
 */
async function importCategory(
  category: string,
  country: CountryCode,
): Promise<void> {
  console.log(`\n📦 Importing ${category} (${country.toUpperCase()})...`);

  const rawProducts = await discoverProducts(category, country, 100);
  console.log(`  Found ${rawProducts.length} candidate products`);

  const stats = {
    inserted: 0,
    updated: 0,
    skipped: 0,
  };

  for (const product of rawProducts) {
    const result = await importProduct(product, category, country);
    stats[result]++;
  }

  console.log(
    `  ✅ Category Result: ${stats.inserted} new, ${stats.updated} updated, ${stats.skipped} skipped`,
  );
}

/**
 * Main entry point
 */
async function main() {
  console.log("🚀 CleverPrices Product Import\n");

  // Check Keepa configuration
  if (!isKeepaConfigured()) {
    console.error("❌ KEEPA_API_KEY not configured. Add it to .env.local");
    process.exit(1);
  }

  // Check token status
  const tokens = await getTokenStatus();
  console.log(
    `💰 Keepa tokens: ${tokens.tokensLeft} available, ${tokens.refillRate}/min refill`,
  );

  if (tokens.tokensLeft < 100) {
    console.warn("⚠️  Low on tokens. Consider waiting for refill.");
  }

  // Parse arguments
  const args = process.argv.slice(2);
  const categoryArg = args[0] || "all";
  const countryArg = (args[1] || "de") as CountryCode;

  // Categories to import
  const categories =
    categoryArg === "all"
      ? ["hard-drives", "ram", "power-supplies"]
      : [categoryArg];

  console.log(`\n📋 Categories: ${categories.join(", ")}`);
  console.log(`🌍 Country: ${countryArg.toUpperCase()}\n`);

  // Import each category
  for (const category of categories) {
    await importCategory(category, countryArg);
  }

  // Final token check
  const finalTokens = await getTokenStatus();
  console.log(
    `\n✅ Import complete! Tokens remaining: ${finalTokens.tokensLeft}`,
  );
}

main().catch(console.error);
