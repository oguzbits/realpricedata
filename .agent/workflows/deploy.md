---
description: Deploy the application to production securely
---

# Deploy to Production

This workflow ensures all checks pass before deploying.

1. **Type Check**
   Ensure no TypeScript errors exist.

   ```bash
   bun run type-check || tsc --noEmit
   ```

2. **Linting**
   Check for code style issues.

   ```bash
   bun run lint
   ```

3. **Build Verification**
   Ensure the app builds locally.

   ```bash
   bun run build
   ```

4. **Database Push**
   Ensure schema is up to date (interactive).

   ```bash
   bun run db:push
   ```

5. **Deploy Data** (Optional)
   If you need to sync local data to cloud.

   ```bash
   bun run db:deploy
   ```

6. **Vercel Deploy**
   Trigger Vercel deployment (if using CLI).
   ```bash
   vercel --prod
   ```
