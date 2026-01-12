import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "./schema";

// Environment detection
// Treat any Vercel environment (production or preview) as production-like for DB connection
const isVercelProduction = process.env.VERCEL === "1";

/**
 * Database Configuration
 *
 * This module supports three modes:
 * 1. Production (Vercel): Connects to Turso cloud database
 * 2. Development with Turso: Uses embedded replica that syncs from cloud
 * 3. Development/Build local-only: Uses local SQLite file (fallback)
 *
 * To use Turso in development, set:
 * - TURSO_DATABASE_URL: Your Turso database URL
 * - TURSO_AUTH_TOKEN: Your Turso auth token
 *
 * Without these, it falls back to local SQLite file.
 */

// Determine database URL
function getDatabaseUrl(): string {
  // Explicit local override? Use it
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  // Has Turso config? Use it
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // Production without Turso? Error
  if (isVercelProduction) {
    throw new Error("TURSO_DATABASE_URL is required in Vercel production");
  }

  // Local development/build: Use local file
  return process.env.DATABASE_PATH || "file:./data/cleverprices.db";
}

// Create libSQL client
function createDbClient(): Client {
  const url = getDatabaseUrl();

  // Has Turso credentials? Use direct connection
  if (
    process.env.TURSO_DATABASE_URL &&
    process.env.TURSO_AUTH_TOKEN &&
    !process.env.DISABLE_TURSO_SYNC
  ) {
    // Check if we should use embedded replica (local dev with cloud sync)
    // or direct connection (production)
    if (!isVercelProduction && url.startsWith("file:")) {
      // Development: Embedded replica that syncs from Turso cloud
      console.log("[DB] Using embedded replica with Turso sync");
      return createClient({
        url, // Local file
        syncUrl: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    }

    // Production or direct Turso URL: Direct connection
    return createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // Local-only mode (no Turso config)
  console.log("[DB] Using local SQLite (no Turso sync)");
  return createClient({ url });
}

// Create client and Drizzle instance
const client = createDbClient();
export const db: LibSQLDatabase<typeof schema> = drizzle(client, { schema });

// Debug log
(async () => {
  try {
    const url = getDatabaseUrl();
    console.log(`[DB DEBUG] Initialized with URL: ${url}`);
    const result = await client.execute("SELECT count(*) as C FROM products");
    console.log(`[DB DEBUG] Products count on startup: ${result.rows[0].C}`);
  } catch (e) {
    console.error("[DB DEBUG] Failed to check DB:", e);
  }
})();

// Export schema for convenience
export * from "./schema";

// Export client for direct access if needed
export { client };

/**
 * Sync embedded replica from Turso cloud
 * Call this periodically or on-demand in development
 */
export async function syncFromCloud(): Promise<void> {
  if (!isVercelProduction && process.env.TURSO_DATABASE_URL) {
    await client.sync();
    console.log("[DB] Synced from Turso cloud");
  }
}
