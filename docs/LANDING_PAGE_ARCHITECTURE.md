# Landing Page Architecture & Update Mechanism

## Overview

The landing page (`/`) is designed to be **dynamic, self-updating, and high-performance**. It moves away from static manual curation and relies entirely on data-driven algorithms to surface products from the database.

## Data Sections

The page features three main dynamic sections, each powered by a specific DB query:

1.  **Top Offer ("Aktuelle Deals für dich")**
    - **Source**: `getBestDeals()`
    - **Logic**: Finds products where the _current price_ is significantly lower than the _30-day average price_.
    - **Sorting**: Descending order of discount percentage.
    - **Goal**: Automatically surface price drops.

2.  **Bestseller**
    - **Source**: `getMostPopular()`
    - **Logic**: Uses the `Sales Rank` provided by Keepa/Amazon.
    - **Sorting**: Ascending sales rank (lower is better).
    - **Goal**: Show what is currently trending/selling well across Amazon.

3.  **New Arrivals ("Neuheiten")**
    - **Source**: `getNewArrivals()`
    - **Logic**: Based on the `createdAt` timestamp in the database.
    - **Sorting**: Newest first.
    - **Goal**: Highlight recently imported products.

## Caching & Updates

To ensure the page is fast but doesn't show stale data forever, we use **Next.js 16's Caching System** with a custom "Price Cache Profile".

### Configuration (`next.config.ts`)

```typescript
cacheLife: {
  prices: {
    stale: 3600,      // 1 hour
    revalidate: 7200, // 2 hours
    expire: 86400,    // 24 hours
  },
},
```

### How Updates Work

1.  **Immediate (0-1 Hour)**: Users see the cached version instantly. It's super fast.
2.  **Background Refresh (1-2 Hours)**: If a user visits after 1 hour, they still get the fast cached version, but Next.js triggers a **background revalidation**. The _next_ visitor will see the updated data.
3.  **Hard Refresh (After 2 Hours)**: The data is considered too old. Next.js fetches fresh data from the DB before rendering the page.

### Manual Force Update

If you need to update the landing page _immediately_ (e.g., after fixing a critical pricing error), you can clear the Next.js cache:

```bash
# In development
rm -rf .next

# In production (Vercel)
# Go to Vercel Dashboard -> Deployments -> Redeploy
# OR use on-demand revalidation (requires API implementation)
```

## Adding New Sections

To add a new section (e.g., "Most Viewed"):

1.  Define the query function in `src/lib/product-registry.ts`.
2.  Expose it in `src/lib/server/cached-products.ts` with `"use cache"` and `cacheLife("prices")`.
3.  Update `src/components/HomeContent.tsx` to fetch the new data.
4.  Pass the data to `IdealoHomePage.tsx`.
