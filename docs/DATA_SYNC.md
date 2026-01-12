# Data Sync Architecture

CleverPrices maintains a high-quality product catalog using a two-pronged approach for data synchronization:

## 1. Product Discovery & Import (`scripts/keepa-worker.ts`)

**Purpose:** Finds new products to add to our catalog and updates their core details (title, specs, sales rank).

- **Command:** `bun run worker de`
- **Logic:**
  1.  Auto-rotates through all active categories.
  2.  Checks Amazon Best Sellers to discover high-relevance products.
  3.  Respects Keepa API token limits (waits automatically if low on tokens).
  4.  Runs continuously in a loop (if `--continuous` flag is used).

> **When to run:** This should technically run forever in the background on a server to keep the catalog growing. For local dev, run it when you want to import more products.

## 2. Price History Snapshots (`scripts/collect-price-history.ts`)

**Purpose:** Builds our own independent price history charts by snapshotting the _current_ price of every product in our DB once per day.

- **Command:** `bun run collect-history` (or auto-cron on Vercel)
- **Logic:**
  1.  Reads the current `prices` table.
  2.  Writes a record to the `price_history` table with today's timestamp.
  3.  Skips if a record already exists for today.

> **Why?** Keepa gives us history upon import, but to keep it updated without paying for millions of Keepa tokens, we simply record the price ourselves every day. This creates a "long-tail" history for free.

## 3. Deployment Sync (`scripts/deploy-data.ts`)

**Purpose:** Pushes your local database content to the production cloud database (Turso).

- **Command:** `bun run db:deploy`
- **Use Case:** You imported 500 products locally using the worker. Now you want them live on the website.

---

## Summary of Commands

| Task                   | Command                   | Document                      |
| :--------------------- | :------------------------ | :---------------------------- |
| **Import Products**    | `bun run worker de`       | `PROJECT_CONTEXT.md`          |
| **Record Daily Price** | `bun run collect-history` | `PRICE_HISTORY_AUTOMATION.md` |
| **Push to Prod**       | `bun run db:deploy`       | `.agent/workflows/deploy.md`  |
