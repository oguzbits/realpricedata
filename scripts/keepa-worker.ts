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

import { execSync } from "child_process";
import { sql } from "drizzle-orm";
import { db, products } from "../src/db";
import type { CountryCode } from "../src/lib/countries";
import { getTokenStatus } from "../src/lib/keepa/product-discovery";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const STATE_FILE = "logs/worker-state.json";

interface WorkerState {
  lastRun: number;
  lastRunHuman?: string;
  lastCloudSync: number;
  lastCloudSyncHuman?: string;
}

function loadInitialState(): WorkerState {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("⚠️ Could not load state file, starting fresh:", e);
  }
  return { lastRun: 0, lastCloudSync: 0 };
}

function saveStateToDisk(state: WorkerState) {
  try {
    if (!existsSync("logs")) {
      mkdirSync("logs");
    }
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error(
      "⚠️ Failed to save worker state to disk (continuing with in-memory state):",
      e,
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  let country: CountryCode = "de";
  let isContinuous = false;

  // Parsing arguments
  let silent = false;
  for (const arg of args) {
    if (arg === "--continuous" || arg === "-c") {
      isContinuous = true;
    } else if (arg === "--silent" || arg === "-s") {
      silent = true;
    } else if (arg !== "-" && !arg.startsWith("--") && /^[a-z]{2}$/.test(arg)) {
      country = arg as CountryCode;
    }
  }

  const notify = (message: string) => {
    if (silent) return;
    try {
      const safeMessage = message.replace(/"/g, '\\"');
      // Synchronous execution ensures it finishes before we exit.
      // Using timeout to prevent hanging if osascript stalls.
      execSync(
        `osascript -e 'display notification "${safeMessage}" with title "CleverPrices Worker" sound name "Glass"'`,
        { stdio: "ignore", timeout: 1000 },
      );
    } catch (e) {
      console.error("Notify failed:", e);
    }
  };

  // Graceful shutdown handlers
  const onShutdown = (signal: string) => {
    // Prevent double execution
    process.removeAllListeners("SIGINT");
    process.removeAllListeners("SIGTERM");
    process.removeAllListeners("SIGHUP");

    try {
      console.log(`\n🛑 Worker stopped (${signal}).`);
    } catch {}

    if (!silent) notify("Worker stopped.");
    process.exit(0);
  };
  process.on("SIGINT", () => onShutdown("SIGINT"));
  process.on("SIGTERM", () => onShutdown("SIGTERM"));
  process.on("SIGHUP", () => onShutdown("SIGHUP"));

  console.log("👷 Keepa Maintenance Worker Started");
  console.log(`🌍 Focus Country: ${country.toUpperCase()}`);
  console.log(`🔄 Mode: ${isContinuous ? "Continuous" : "Single Pass"}`);
  console.log(`🔔 Notifications: ${silent ? "Disabled" : "Enabled"}`);
  console.log(
    "💡 Usage: bun run worker [country] [-c|--continuous] [-s|--silent]\n",
  );

  let cycleCount = 1;
  const state = loadInitialState();

  // Twice-daily target: 12,000 - 14,000 products
  const PRODUCT_TARGET_MAX = 14000;

  while (true) {
    // 0. Database Status Check
    try {
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
    } catch (dbError) {
      console.error("❌ Database Connection Failed:", dbError);
      throw dbError; // Trigger fatal error
    }

    const now = Date.now();
    const WORK_COOLDOWN = 15 * 60 * 1000; // 15 minutes
    const syncInterval = parseInt(
      process.env.SYNC_INTERVAL_MS || String(12 * 60 * 60 * 1000),
    );

    let workPerformed = false;

    // Check if we should skip work phase due to recent run
    if (now - state.lastRun < WORK_COOLDOWN) {
      const minsAgo = Math.round((now - state.lastRun) / 60000);
      console.log(`⏳ Recently ran (${minsAgo}m ago). Skipping work phase.`);
    } else {
      const runCompliancePhase = async () => {
        console.log("\n⚖️ Phase 1: Compliance Sync (Daily Price Updates)");
        execSync(`bun run scripts/update-prices.ts ${country} --stale`, {
          stdio: "inherit",
        });
      };

      const runEnrichmentPhase = async () => {
        try {
          const tokens = await getTokenStatus();
          if (tokens.tokensLeft > 400) {
            console.log(
              "\n🧪 Phase 2: Metadata Enrichment (Features & History)",
            );
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
        } catch (tokenError) {
          console.error("❌ Failed to check tokens:", tokenError);
        }
      };

      // Execute phases
      try {
        await runCompliancePhase();
        await runEnrichmentPhase();

        // Update Memory
        state.lastRun = Date.now();
        state.lastRunHuman = new Date(state.lastRun).toLocaleString();
        workPerformed = true;

        // Persist
        saveStateToDisk(state);
      } catch (e) {
        console.error("❌ Phase execution failed:", e);
      }
    }

    // Phase 3: Cloud Sync (Periodically)
    if (now - state.lastCloudSync >= syncInterval) {
      console.log("\n☁️  Phase 3: Cloud Sync (Local -> Turso)");
      try {
        execSync(`bun run scripts/deploy-data.ts`, {
          stdio: "inherit",
        });

        // Update Memory
        state.lastCloudSync = Date.now();
        state.lastCloudSyncHuman = new Date(
          state.lastCloudSync,
        ).toLocaleString();

        // Persist
        saveStateToDisk(state);

        console.log("✅ Cloud sync successful.");
      } catch (e) {
        console.error("❌ Cloud sync failed:", e);
      }
    } else {
      const nextSyncIn = Math.round(
        (syncInterval - (now - state.lastCloudSync)) / (60 * 1000),
      );
      if (workPerformed) {
        // Only log skip if we actually did something else, otherwise it's spammy
        console.log(
          `\n⏭️  Skipping cloud sync (Next sync in ~${nextSyncIn} mins)`,
        );
      }
    }

    if (!isContinuous) {
      console.log("\n✅ Single pass complete.");
      break;
    }

    cycleCount++;

    // Smart Sleep Implementation
    // We want to wake up for whichever event comes first:
    // 1. Next Standard Work Cycle (Price/Enrichment)
    // 2. Next Cloud Sync (Database Deploy)

    const nowLocal = Date.now();

    // 1. Next Work calculation
    const nextWorkTime = state.lastRun + WORK_COOLDOWN;
    const msUntilWork = Math.max(0, nextWorkTime - nowLocal);

    // 2. Next Sync calculation
    const nextSyncTime = state.lastCloudSync + syncInterval;
    const msUntilSync = Math.max(0, nextSyncTime - nowLocal);

    // Determine winner
    const sleepTime = Math.max(10000, Math.min(msUntilWork, msUntilSync));
    const nextEventName =
      msUntilSync < msUntilWork ? "Cloud Sync" : "Standard Cycle";
    const nextEventTime = new Date(nowLocal + sleepTime).toLocaleTimeString();
    const minsToSleep = Math.round(sleepTime / 60000);

    console.log(`\n📅 Schedule:`);
    console.log(
      `   • Standard Cycle: ${new Date(nextWorkTime).toLocaleTimeString()}`,
    );
    console.log(
      `   • Cloud Sync:     ${new Date(nextSyncTime).toLocaleString()}`,
    );

    console.log(
      `\n💤 Cycle complete. Sleeping ${minsToSleep}m until next ${nextEventName} at ${nextEventTime}...`,
    );
    await new Promise((r) => setTimeout(r, sleepTime));
  }

  return notify; // Return notify for use in catch block reference if needed, though we can't access it easily outside.
  // Actually due to scoping, we need to handle the catch block inside the scope OR pass the notify function out.
  // Easiest is to move the catch INSIDE main or define notify OUTSIDE.
  // Refactoring to define notify outside or keep simplified structure.

  // Re-structuring slightly to ensure notify is available.
}

// Global notify placeholder
let globalNotify = (msg: string) => {};

// We need to wrap the whole thing to share scope properly or just duplicate logic.
// Simplest is to just put the runner logic in the main function.
main().catch((err) => {
  console.error(err);
  // We can't access 'notify' here because it's local to main.
  // We will re-implement a simple silent check here or rely on the process.argv

  const isSilent =
    process.argv.includes("--silent") || process.argv.includes("-s");
  if (!isSilent) {
    try {
      const errorMessage = String(err).slice(0, 100).replace(/"/g, '\\"');
      execSync(
        `osascript -e 'display notification "Error: ${errorMessage}" with title "CleverPrices Worker Stopped" sound name "Glass"'`,
        { stdio: "ignore" },
      );
    } catch (e) {}
  }

  process.exit(1);
});
