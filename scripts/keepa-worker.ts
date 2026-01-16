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

import { getTokenStatus } from "../src/lib/keepa/product-discovery";
import type { CountryCode } from "../src/lib/countries";
import { execSync } from "child_process";
import { db, products } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  let country: CountryCode = "de";
  let isContinuous = false;

  // Parsing arguments
  for (const arg of args) {
    if (arg === "--continuous" || arg === "-c") {
      isContinuous = true;
    } else if (arg !== "-" && !arg.startsWith("--") && /^[a-z]{2}$/.test(arg)) {
      country = arg as CountryCode;
    }
  }

  console.log("👷 Keepa Maintenance Worker Started");
  console.log(`🌍 Focus Country: ${country.toUpperCase()}`);
  console.log(`🔄 Mode: ${isContinuous ? "Continuous" : "Single Pass"}`);
  console.log("💡 Usage: bun run worker [country] [-c|--continuous]\n");

  let cycleCount = 1;
  let lastSyncTime = 0; // Initialize to 0 to trigger sync on first run

  // Twice-daily target: 12,000 - 14,000 products
  const PRODUCT_TARGET_MAX = 14000;

  while (true) {
    // 0. Database Status Check
    const productStats = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    const count = productStats[0]?.count || 0;

    console.log(`\n--- Starting Maintenance Cycle #${cycleCount} ---`);
    console.log(
      `📊 Current Catalog Size: ${count} / ${PRODUCT_TARGET_MAX} products`,
    );
    if (count > PRODUCT_TARGET_MAX) {
      console.log(
        "⚠️  Warning: Catalog size exceeds twice-daily update budget (14k). Consider pruning.",
      );
    }

    const runCompliancePhase = async () => {
      console.log("\n⚖️ Phase 1: Compliance Sync (Daily Price Updates)");
      try {
        // This targets products with stale prices (>20h) or no prices
        execSync(`bun run scripts/update-prices.ts ${country} --stale`, {
          stdio: "inherit",
        });
      } catch (e) {
        console.error("❌ Compliance sync failed:", e);
      }
    };

    const runEnrichmentPhase = async () => {
      const tokens = await getTokenStatus();
      if (tokens.tokensLeft > 400) {
        console.log("\n🧪 Phase 2: Metadata Enrichment (Features & History)");
        try {
          execSync(`bun run scripts/enrich-products.ts`, {
            stdio: "inherit",
          });
        } catch (e) {
          console.error("❌ Enrichment failed:", e);
        }
      } else {
        console.log(
          `\n⏭️ Skipping enrichment (Low tokens: ${tokens.tokensLeft})`,
        );
      }
    };

    // Execute phases
    await runCompliancePhase();
    await runEnrichmentPhase();

    // Phase 3: Cloud Sync (Periodically)
    const now = Date.now();
    const syncInterval = parseInt(
      process.env.SYNC_INTERVAL_MS || String(12 * 60 * 60 * 1000),
    );

    // We tracks last sync in a simple way for this process
    if (now - lastSyncTime >= syncInterval) {
      console.log("\n☁️  Phase 3: Cloud Sync (Local -> Turso)");
      try {
        execSync(`bun run scripts/deploy-data.ts`, {
          stdio: "inherit",
        });
        lastSyncTime = now;
        console.log("✅ Cloud sync successful.");
      } catch (e) {
        console.error("❌ Cloud sync failed:", e);
      }
    } else {
      const nextSyncIn = Math.round(
        (syncInterval - (now - lastSyncTime)) / (60 * 1000),
      );
      console.log(
        `\n⏭️  Skipping cloud sync (Next sync in ~${nextSyncIn} mins)`,
      );
    }

    if (!isContinuous) {
      console.log("\n✅ Single pass complete.");
      break;
    }

    cycleCount++;
    console.log(`\n💤 Maintenance cycle complete. Resting 15 minutes...`);
    await new Promise((r) => setTimeout(r, 15 * 60 * 1000));
  }
}

main().catch(console.error);
