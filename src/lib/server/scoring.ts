import { Product } from "@/lib/product-registry";

export interface ProductScore {
  popularityScore: number;
  revenue: number;
  prestigeMultiplier: number;
  isPrestige: boolean;
  scoreBreakdown: {
    revenue: number;
    salesRank: number;
    quality: number;
    prestige: number;
    tech: number;
    penalty: number;
  };
}

const PRESTIGE_BRANDS = [
  "apple",
  "sony",
  "bose",
  "samsung",
  "sennheiser",
  "jbl",
  "nvidia",
  "asus",
  "msi",
  "lg",
  "microsoft",
  "google",
  "panasonic",
  "philips",
  "hp",
  "dell",
  "logitech",
  "western digital",
  "sandisk",
  "nintendo",
  "canon",
  "nikon",
  "playstation",
  "xbox",
  "lego",
];

const BUDGET_BRANDS = [
  "xiaomi",
  "hisense",
  "tcl",
  "medion",
  "teclast",
  "chuwi",
];

const ULTRA_PREMIUM_TECH = ["oled", "mini-led", "qd-oled", "8k", "neo qled"];
const PREMIUM_TECH_KEYWORDS = ["qled", "pro", "ultra"];

/**
 * Shared scoring logic to ensure consistency across Category pages and Landing page.
 */
export function calculateDesirabilityScore(
  p: Product,
  price: number,
  title: string,
  context: "category" | "landing" = "category",
): ProductScore {
  const brand = (p.brand || "").toLowerCase();
  const monthlySold = p.monthlySold || 0;
  const reviewCount = p.reviewCount || 0;
  const rating = p.rating || 0;
  const salesRank = p.salesRank || 0;

  // 1. Revenue Component (Price^1.5/1.7 * Sales)
  // Exponentially favors high-end gear to offset high-volume budget items
  const baseRevExp = price > 400 ? 1.7 : 1.5;
  let revenue = Math.pow(price, baseRevExp) * monthlySold;

  const isPrestige = PRESTIGE_BRANDS.includes(brand);

  // Landing page uses a much more aggressive prestige bias for Hero sections
  const prestigeMultiplier = context === "landing" ? 5 : 3;
  if (isPrestige) revenue *= prestigeMultiplier;

  // 5. Technology Analysis
  const titleLower = title.toLowerCase();
  const hasPremiumTech = PREMIUM_TECH_KEYWORDS.some((tech) =>
    titleLower.includes(tech),
  );

  // Detect "Commodity" or "Old" tech in premium-heavy categories
  // For TVs: Standard LED, 60Hz
  // For Monitors: Office/Standard LCD
  const commodityTech = ["led", "60hz", "lcd", "ips", "1080p", "hdtv"];
  const isCommodityTech =
    !hasPremiumTech && commodityTech.some((tech) => titleLower.includes(tech));

  // --- ADJUSTMENT ---
  // If it's a prestige brand but ONLY selling commodity tech (e.g. Sony LED TV),
  // we reduce its revenue multiplier because it's not a "Flagship" indicator.
  const techSensitiveCategories = [
    "tvs",
    "monitor",
    "smartphones",
    "laptop",
    "gpu",
    "cpu",
  ];
  const isTechSensitive = techSensitiveCategories.includes(p.category);

  if (isPrestige && isTechSensitive && isCommodityTech) {
    revenue *= 0.3; // 70% penalty on the revenue signal for commodity prestige items
  }

  let popularityScore = 0;

  // Revenue Weight (The core signal)
  const revenueComponent = revenue / 15000;
  popularityScore += revenueComponent;

  // 2. Sales Rank Component
  let salesRankComponent = 0;
  if (salesRank > 0) {
    if (salesRank < 100) salesRankComponent = 500;
    else if (salesRank < 1000) salesRankComponent = 250;
    else if (salesRank < 5000) salesRankComponent = 100;
    else if (salesRank < 20000) salesRankComponent = 30;
  }
  popularityScore += salesRankComponent;

  // 3. Quality Factor (Rating & Reviews)
  let qualityComponent = 0;
  if (rating >= 4.5) qualityComponent += 50;
  if (reviewCount > 1000) qualityComponent += 50;
  else if (reviewCount > 100) qualityComponent += 20;
  popularityScore += qualityComponent;

  // 5. Technology Bonus
  const isUltraPremium = ULTRA_PREMIUM_TECH.some((tech) =>
    titleLower.includes(tech),
  );
  const isPremium = PREMIUM_TECH_KEYWORDS.some((tech) =>
    titleLower.includes(tech),
  );

  // 4. Prestige Bonus (Flat boost)
  let prestigeComponent = 0;
  if (isPrestige) {
    if (isTechSensitive && !isUltraPremium) {
      prestigeComponent = 500; // Demote non-flagship prestige items in tech-sensitive cats
    } else {
      prestigeComponent = 2000;
    }
  }
  popularityScore += prestigeComponent;

  // 5. Technology Bonus
  let techComponent = 0;
  if (isUltraPremium) {
    techComponent = 3000; // Tier 1: Massive boost for OLED/Mini-LED
  } else if (isPremium) {
    techComponent = 1000; // Tier 2: Solid boost for QLED/Pro gear
  } else if (isTechSensitive && isCommodityTech) {
    techComponent = -2000; // Systemic penalty for standard/old tech in premium categories
  }
  popularityScore += techComponent;

  // 6. Budget Penalties (Manual curated gates)
  let penaltyComponent = 0;
  const isBudgetBrand = BUDGET_BRANDS.includes(brand);
  const isEntryLevelPhilips = brand === "philips" && price < 500;

  if (isBudgetBrand || isEntryLevelPhilips) {
    // Landing page is much stricter - it effectively blocks budget brands
    penaltyComponent = context === "landing" ? -50000 : -20000;
  }
  popularityScore += penaltyComponent;

  return {
    popularityScore,
    revenue,
    prestigeMultiplier,
    isPrestige,
    scoreBreakdown: {
      revenue: revenueComponent,
      salesRank: salesRankComponent,
      quality: qualityComponent,
      prestige: prestigeComponent,
      tech: techComponent,
      penalty: penaltyComponent,
    },
  };
}
