import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration for Turso/libSQL
 *
 * Supports:
 * - Production: Turso cloud database (TURSO_DATABASE_URL)
 * - Development: Local SQLite file with optional cloud sync
 *
 * Usage:
 * - `bun run db:push` - Push schema to configured database
 * - `bun run db:studio` - Open Drizzle Studio
 * - `bun run db:generate` - Generate migration files
 */

const isProduction = process.env.NODE_ENV === "production";
const hasTursoConfig = !!process.env.TURSO_DATABASE_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    // Use Turso cloud URL in production, or if configured in dev
    url:
      isProduction || hasTursoConfig
        ? process.env.TURSO_DATABASE_URL!
        : "file:./data/cleverprices.db",
    // Auth token required for Turso cloud
    authToken:
      isProduction || hasTursoConfig ? process.env.TURSO_AUTH_TOKEN : undefined,
  },
});
