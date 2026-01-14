#!/usr/bin/env bun
/**
 * Keepa Scheduled Worker
 *
 * Periodically syncs products from Keepa while respecting token limits.
 * Handles automatic token refills and category rotation.
 *
 * Usage:
 *   bun run scripts/keepa-worker.ts [country] [--continuous]
 */

import { getAllCategories } from "../src/lib/categories";
import {
  getTokenStatus,
  discoverProducts,
} from "../src/lib/keepa/product-discovery";
import type { CountryCode } from "../src/lib/countries";
import { execSync } from "child_process";
import { db, products } from "../src/db";
import { eq, sql } from "drizzle-orm";

// Configuration
const REFILL_WAIT_MS = 60 * 1000; // 1 minute
const TOKEN_SAFE_THRESHOLD = 200; // Minimum tokens before starting a category (Optimized)
const BATCH_IMPORT_TIMEOUT = 1000 * 60 * 10; // 10 minutes max per category

/**
 * INITIAL_POPULATION_MODE
 * - true: Focus on discovering new products first (Growth), then do compliance sync.
 * - false: Focus on ToS compliance (Stale prices) first, then discover new products.
 */
const INITIAL_POPULATION_MODE = true;

async function main() {
  const args = process.argv.slice(2);
  let country: CountryCode = "de";
  let isContinuous = false;

  // Improved parsing to avoid crashes if arguments are malformed
  for (const arg of args) {
    if (arg === "--continuous" || arg === "-c" || arg.includes("continous")) {
      isContinuous = true;
    } else if (arg !== "-" && !arg.startsWith("--") && /^[a-z]{2}$/.test(arg)) {
      country = arg as CountryCode;
    }
  }

  console.log("👷 Keepa Worker Started");
  console.log(`🌍 Default Country: ${country.toUpperCase()}`);
  console.log(`🔄 Mode: ${isContinuous ? "Continuous" : "Single Pass"}`);
  console.log("💡 Usage: bun run worker [country] [-c|--continuous]\n");

  const categories = getAllCategories().filter(
    (c) => !c.hidden && c.slug !== "electronics",
  );
  console.log(`📋 Found ${categories.length} active categories to sync.`);

  // Tier definitions (Dynamic caps)
  const TIER_A = [
    "smartphones",
    "gpu",
    "cpu",
    "tvs",
    "notebooks",
    "headphones",
    "monitors",
    "systemkameras",
    "tablets",
    "hard-drives",
    "ssds",
    "ram",
  ];
  const TIER_B = [
    "motherboards",
    "speakers",
    "routers",
    "espressomaschinen",
    "waschmaschinen",
    "kuehlschraenke",
    "power-supplies",
    "pc-cases",
    "keyboards",
    "mice",
    "smartwatches",
    "game-controllers",
    "soundbars",
    "drones",
  ];

  const getTargetCount = (slug: string) => {
    if (TIER_A.includes(slug)) return 1000;
    if (TIER_B.includes(slug)) return 300;
    return 100; // Tier C
  };

  let cycleCount = 1;

  while (true) {
    console.log(`\n--- Starting Sync Cycle #${cycleCount} ---`);
    if (INITIAL_POPULATION_MODE) {
      console.log("⚡ MODE: Initial Population (Growth Priority)");
    }

    const runCompliancePhase = async () => {
      console.log("\n⚖️ Phase: Compliance Sync (Daily Price Updates)");
      try {
        execSync(`bun run scripts/update-prices.ts ${country} --stale`, {
          stdio: "inherit",
        });
      } catch (e) {
        console.error("❌ Compliance sync failed:", e);
      }
    };

    const runGrowthPhase = async () => {
      console.log(
        "\n🌱 Note: Category Growth (Discovery) is now handled via manual CSV imports.",
      );
      console.log(
        "   To add new products, use: bun run scripts/import-from-csv.ts <file>",
      );
    };

    // enrichment logic (moved into main for better flow)
    const runEnrichmentPhase = async () => {
      const tokens = await getTokenStatus();
      if (tokens.tokensLeft > 400) {
        console.log("\n🧪 Phase: Targeted Enrichment (Seeding History)");
        try {
          execSync(`bun run scripts/enrich-products.ts`, {
            stdio: "inherit",
          });
        } catch (e) {
          console.error("❌ Enrichment failed:", e);
        }
      } else {
        console.log(
          `\n⏭️ Skipping enrichment this cycle (Low tokens: ${tokens.tokensLeft})`,
        );
      }
    };

    // Execute phases: Prices first, then history seeding
    await runCompliancePhase();
    await runEnrichmentPhase();

    if (!isContinuous) {
      console.log("\n✅ Single pass complete.");
      break;
    }

    cycleCount++;
    console.log(`\n💤 Cycle complete. Resting 30m...`);
    await new Promise((r) => setTimeout(r, 30 * 60 * 1000));
  }
}

main().catch(console.error);
