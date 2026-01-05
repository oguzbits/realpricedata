# Price History Automation Setup

This document explains how to enable automatic daily price history collection.

## Overview

The system collects price snapshots daily and stores them in the `price_history` table. Over time, this builds up data for:

- Price history charts
- "Is this a good deal?" recommendations
- Price drop detection

## Prerequisites

- Vercel project deployed
- Database with products and prices

---

## Setup Steps

### 1. Generate a Cron Secret

Run this command to generate a secure random string:

```bash
openssl rand -base64 32
```

Copy the output (e.g., `dK3x9mPq2vN8bY4wA1sE7hL6jR0tU5cI...`)

### 2. Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** (paste your generated secret)
   - **Environment:** Production (and Preview if desired)
4. Click **Save**

### 3. Enable the Cron Configuration

Copy the pre-made config to the project root:

```bash
cp .future/vercel.json.disabled vercel.json
```

### 4. Deploy

```bash
git add vercel.json
git commit -m "feat: enable price history cron job"
git push
```

### 4. Verify It's Working

After deployment:

1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by "Cron"
3. Wait for 6 AM UTC (or trigger manually, see below)

---

## Configuration

### Schedule

The cron runs at **6 AM UTC daily**. To change:

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/collect-history",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Common schedules:

- `0 6 * * *` - Daily at 6 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sundays

### Manual Trigger (for testing)

You can trigger the cron manually:

```bash
curl -X GET "https://your-site.vercel.app/api/cron/collect-history" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or run the local script:

```bash
bun run collect-history all
```

---

## Files Involved

| File                                        | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `vercel.json`                               | Cron schedule configuration |
| `src/app/api/cron/collect-history/route.ts` | API endpoint Vercel calls   |
| `scripts/collect-price-history.ts`          | Manual/local script         |
| `src/lib/price-analysis.ts`                 | Analyzes collected history  |

---

## Database Tables

The cron job writes to `price_history`:

```sql
-- View collected history
SELECT * FROM price_history ORDER BY recorded_at DESC LIMIT 10;

-- Count records per product
SELECT product_id, COUNT(*) as days
FROM price_history
GROUP BY product_id;
```

---

## Troubleshooting

### Cron not running?

1. Check Vercel logs for errors
2. Verify `CRON_SECRET` is set correctly
3. Ensure `vercel.json` is deployed

### No data being collected?

1. Make sure `prices` table has data first
2. Check that products have `amazonPrice` or `newPrice` values

### Test locally

```bash
bun run collect-history us
```

---

## Cost

- **Vercel Hobby (Free):** 1 cron job included
- **Vercel Pro:** Unlimited cron jobs

This setup uses 0 external API tokens and costs **$0**.
