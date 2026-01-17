# Performance Optimization Roadmap 🚀

This roadmap tracks the remaining "Pro-level" performance optimizations for CleverPrices to ensure it remains remarkably fast as the catalog grows.

---

## 🟢 Phase 1: Edge & Search Efficiency

_These tasks reduce initial latency and browser memory usage._

- [x] **Task 1: Migrate Redirects to Edge Proxy**
  - **Goal**: Move path-based redirects (e.g., removing old `/fr/`, `/it/` prefixes) from `next.config.ts` to `src/proxy.ts`.
  - **Benefit**: Executes at the Vercel Edge (closest to user) in ~10ms, bypassing the Node.js runtime entirely.
  - **Status**: Completed.

- [ ] **Task 2: Prune Search Index Payloads**
  - **Goal**: Strip non-essential fields (long descriptions, full price history) from products before indexed by the search manager.
  - **Benefit**: Reduces browser memory usage and makes the search modal snappier.
  - **Status**: Analysis needed.

---

## 🟡 Phase 2: Advanced Caching

_These tasks reduce Turso/Database load and speed up build times._

- [ ] **Task 3: Split Global Category Cache**
  - **Goal**: Refactor `getCachedLocalizedCategoryProducts` to store "Base Product Data" (static) and "Price/Availability Map" (dynamic) separately.
  - **Benefit**: Reduces cache storage redundancy and speeds up cross-country site navigation.
  - **Status**: Conceptual.

- [ ] **Task 4: Incremental Static Regeneration (ISR) Tuning**
  - **Goal**: Audit revalidation times for Product vs. Category pages.
  - **Benefit**: Balances data freshness from Amazon with Vercel build/compute costs.
  - **Status**: ongoing.

---

## 🔵 Phase 3: Visual Polish & LCP

_These tasks focus on Google Lighthouse "Core Web Vitals"._

- [ ] **Task 5: CSS Content-Visibility Audit**
  - **Goal**: Apply `content-visibility: auto` more aggressively to below-the-fold sections on long category pages.
  - **Benefit**: Reduces browser rendering time (Layout/Paint) for very long lists.
  - **Status**: Partially implemented in `globals.css`.

- [ ] **Task 6: Critical CSS & Font Preloading**
  - **Goal**: Ensure the Inter font (and any critical icons) are preloaded to prevent "Flash of Unstyled Text" (FOUT).
  - **Benefit**: Improves LCP and CLS scores.
  - **Status**: Planned.

---

## ✅ Completed Optimizations

- [x] **Convert Category Grid & Cards to Server Components** (Reduced hydration cost by ~80%).
- [x] **Prune redundant DB fields from Category Cache** (Fixed 2MB Vercel Cache limit).
- [x] **Native CSS Carousel Shell** (Buttery smooth horizontal scrolling with 0s JS delay).
- [x] **Above-the-fold Image Priority** (Significant boost to LCP/FCP).
- [x] **ClientDate Component** (Fixed hydration mismatches in timestamps).
