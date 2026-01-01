# Project Features Analysis

## Core Architecture

- **Framework**: Next.js 16 (App Router) with React 19 Compiler.
- **Styling**: Tailwind CSS 4 with `shadcn/ui` components.
- **State**: URL-based state management via `nuqs`.
- **Performance**: Uses Next.js 16 `cacheComponents` ("use cache") and `experimental.optimizePackageImports`.

## implementation Details

### 1. Localization & Routing

- **Dual-Route Groups**: Split into `(en)` and `(de)` for language-specific static pages (e.g., Legal pages in German).
- **Dynamic Country Handling**:
  - **Path**: `src/app/(en)/[country]/` handles most country-specific views.
  - **Logic**: valid country codes (e.g., `/uk`, `/ca`) render `HomeContent`.
  - **Edge Case**: **Top-Level Categories** (e.g., `/electronics`) are also routed through `[country]`. The `page.tsx` checks if the param matches a category slug instead of a country code.
  - **Default**: Root `/` renders US content via `src/app/(en)/(root)/page.tsx`.
- **Persistence**: Country preference saved in cookies (`country` key).
- **Fallbacks**: Browser locale detection -> Defined Country -> Default (US).

### 2. Category System (`src/lib/categories.ts`)

- **Structure**: Flat object `allCategories` with `parent` pointers for hierarchy.
- **Data**: Includes slugs, icons, unit types (TB, GB, W), and SEO metadata.
- **Components**:
  - `parentCategoryView`: Renders intermediate category pages.
  - `ProductTable` (implied): Renders leaf category data.

### 3. Search Functionality (`SearchModal.tsx`)

- **Type**: Client-side modal with keyboard shortcuts (`Cmd+K`, Arrows, Enter).
- **Behavior**:
  - **Empty**: Shows "Featured" and "Quick Access" categories.
  - **Typing**: Filters `ALL_CATEGORIES` in real-time.
  - **No Results**: Shows helpful empty state.

### 4. Blog System

- **Format**: MDX files with frontmatter.
- **Location**: `src/app/(en)/(localized)/[country]/blog` (inferred) or similar localized path.

### 5. Analytics & SEO

- **Analytics**: Vercel Analytics and Speed Insights.
- **SEO**: Dynamic metadata generation utilizing `generateMetadata` in `layout.tsx` and `page.tsx`, respecting `canonical` URLs and `hreflang` (implied logic).

## Critical Edge Cases

1.  **Route Ambiguity**:

    - The `[country]` dynamic segment captures **anything** after root.
    - _Risk_: Adding a new top-level static route (e.g., `/about`) requires ensuring it doesn't conflict or is placed _before_ the dynamic segment in folder structure (or explicitly handled).
    - _Handling_: The current logic explicitly checks `isValidCountryCode(param)` -> `getCategoryBySlug(param)` -> `notFound()`.

2.  **Category Modifications**:

    - Editing `src/lib/categories.ts` automatically updates routes.
    - _Risk_: Changing a category `slug` will break existing URLs and SEO rankings. Redirects must be implemented manually if slugs change.
    - _Constraint_: Parent categories MUST have `unitType` undefined or handled correctly in UI if they aggregate mixed types.

3.  **Localization Mismatch**:

    - Routes are grouped by language (`(en)`, `(de)`).
    - _Risk_: If a country like `es` (Spain) falls under `(en)` group layout, it might show English static UI (headers/footers) unless `PageLayout` handles content translation dynamically.
    - _Current State_: `(en)` handles `[country]` which likely defaults specific UI elements to English unless overridden.

4.  **Cookie Dependency**:
    - Country switching relies on `document.cookie`.

### 6. Design System

- **Theme**: Dark mode default with glassmorphism effects.
- **Components**: `shadcn/ui` tailored for "premium" feel.
- **Responsiveness**: Mobile-first, complex tables adapt columns.

## Safe Extension Guide (How to not break things)

### Adding a New Category

1.  **Edit `src/lib/categories.ts`**:
    - Add entry to `allCategories`.
    - **Critical**: Ensure `unitType` is consistent with parent if applicable.
    - **Route**: No new file needed. `[country]` handles it automatically via `page.tsx` logic.
    - **Icon**: Must be a valid Lucide icon.

### modifying Localization

1.  **Adding a Country**:
    - Update `src/lib/countries.ts` (`countries` object).
    - **Constraint**: New country must likely map to an existing route group `(en)` or `(de)` unless you create a new group.
    - **Cookies**: Country switching logic automatically picks up new valid codes.

### UI/Component Updates

- **Server vs Client**: Most leaf components are Server Components. Interactive parts (Search, Filters) use `nuqs` (Client Side) for URL state.
- **Nuqs**: When adding filters, use `useQueryState` from `nuqs`. Do NOT use standard `useState` for things that should be shareable.
