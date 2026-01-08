import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Category,
  getBreadcrumbs,
  getChildCategories,
  stripCategoryIcon,
} from "@/lib/categories";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryFAQs } from "@/lib/category-faqs";
import { getCategoryContent } from "@/lib/category-content";
import { getCountryByCode, type CountryCode } from "@/lib/countries";
import {
  FilterParams,
  getCategoryProducts,
} from "@/lib/server/category-products";
import { Filter, Info, Search } from "lucide-react";

// FAQ components for SEO
import { FAQSchema } from "@/components/category/FAQSchema";
import { FAQSection } from "@/components/category/FAQSection";

// Product views
import { ProductGrid } from "@/components/category/ProductGrid";
import { ProductTable } from "@/components/category/ProductTable";
import { ViewControls } from "@/components/category/ViewControls";

// Client components
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FilterPanelClient } from "@/components/category/FilterPanelClient";

interface CategoryProductsViewProps {
  category: Omit<Category, "icon">;
  countryCode: CountryCode;
  searchParams: FilterParams;
}

/**
 * SERVER COMPONENT - Filters and renders products on the server
 * This is much faster than client-side filtering and better for SEO
 */
export async function CategoryProductsView({
  category,
  countryCode,
  searchParams,
}: CategoryProductsViewProps) {
  const categorySlug = category.slug;
  const breadcrumbs = getBreadcrumbs(categorySlug).map((crumb) => ({
    ...stripCategoryIcon(crumb),
    Icon: getCategoryIcon(crumb.slug),
  }));
  const countryConfig = getCountryByCode(countryCode);
  const content = getCategoryContent(categorySlug);

  // Get view mode from search params
  const viewMode = searchParams.view || "grid";

  /*
   * SERVER-SIDE FILTERING - This is the key optimization!
   * Refactored to pass primitive arguments (slug) for better caching and stability.
   */
  const { products, filteredCount, unitLabel, hasProducts, filters } =
    await getCategoryProducts(category.slug, countryCode, searchParams);

  const formatCurrency = (value: number, fractionDigits = 2) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  };

  const formatPricePerUnit = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Breadcrumb items for display
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    ...breadcrumbs.map((b) => ({ name: b.name, href: `/${b.slug}` })),
  ];

  // Mobile filter sheet (client component for interactivity)
  const mobileFilterTrigger = (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-zinc-200 bg-white shadow-sm lg:hidden"
        >
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="border-b px-6 py-4 text-left">
          <SheetTitle className="text-lg font-bold">Filter</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <FilterPanelClient
            categorySlug={categorySlug}
            unitLabel={unitLabel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  // Main render - Idealo style layout
  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="mx-auto max-w-[1200px] px-4 py-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={breadcrumbItems}
          className="mb-4 text-[11px] text-zinc-400"
        />

        {/* Main content area */}
        <div className="flex gap-6">
          {hasProducts ? (
            <>
              {/* Desktop Filters Sidebar - Idealo style */}
              <aside className="hidden w-[240px] shrink-0 lg:block">
                <div className="rounded-[6px] border border-[#dcdcdc] bg-white p-4 shadow-sm">
                  <FilterPanelClient
                    categorySlug={categorySlug}
                    unitLabel={unitLabel}
                  />
                </div>
              </aside>

              {/* Main Content */}
              <div className="min-w-0 flex-1">
                {/* View Controls - Title, Sort, Grid/List toggle */}
                <div className="mb-4 rounded-[6px] border border-[#dcdcdc] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {mobileFilterTrigger}
                      <h1 className="text-lg font-bold text-zinc-900">
                        {category.name}
                        <span className="ml-1.5 text-[14px] font-normal text-zinc-400">
                          ({filteredCount.toLocaleString("de-DE")})*
                        </span>
                      </h1>
                    </div>
                    <ViewControls
                      productCount={filteredCount}
                      categoryName={category.name}
                    />
                  </div>
                </div>

                {/* Products - Grid or List view */}
                {products.length > 0 ? (
                  <div className="rounded-[6px] border border-[#dcdcdc] bg-white p-4 shadow-sm">
                    {viewMode === "grid" ? (
                      <ProductGrid
                        products={products}
                        countryCode={countryCode}
                      />
                    ) : (
                      <ProductTable
                        products={products}
                        unitLabel={unitLabel}
                        categorySlug={categorySlug}
                        countryCode={countryCode}
                        sortBy={filters.sortBy}
                        sortOrder={filters.sortOrder}
                        formatCurrency={formatCurrency}
                        formatPricePerUnit={formatPricePerUnit}
                      />
                    )}
                  </div>
                ) : (
                  <NoProductsMatchingFilters />
                )}

                <div className="mt-4 text-center text-[11px] text-zinc-400">
                  Preise inkl. MwSt., ggf. zzgl. Versand. Preise und
                  Verfügbarkeit können sich ändern.
                </div>

                {/* Related Categories for SEO/PR */}
                <div className="mt-8 rounded-[6px] border border-[#dcdcdc] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-[14px] font-bold text-zinc-900">
                    Ähnliche Kategorien
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {getChildCategories(category.parent || "electronics")
                      .filter((c) => c.slug !== categorySlug)
                      .map((related) => (
                        <CategoryCard
                          key={related.slug}
                          category={related}
                          Icon={getCategoryIcon(related.slug)}
                          country={countryCode}
                        />
                      ))}
                  </div>
                </div>

                {/* Intro & Buying Guide for SEO */}
                {content && (
                  <div className="mt-6 rounded-[6px] border border-[#dcdcdc] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-zinc-900">
                      {content.title || `Über ${category.name}`}
                    </h2>

                    {content.intro && (
                      <p className="mb-6 text-[14px] leading-relaxed text-zinc-600">
                        {content.intro}
                      </p>
                    )}

                    {content.guide && content.guide.length > 0 && (
                      <div className="grid gap-6 md:grid-cols-2">
                        {content.guide.map((section, idx) => (
                          <div key={idx} className="space-y-2">
                            <h3 className="text-[14px] font-semibold text-zinc-900">
                              {section.title}
                            </h3>
                            <p className="text-[13px] leading-relaxed text-zinc-600">
                              {section.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FAQ Section for SEO */}
                {getCategoryFAQs(categorySlug).length > 0 && (
                  <>
                    <FAQSchema faqs={getCategoryFAQs(categorySlug)} />
                    <FAQSection
                      faqs={getCategoryFAQs(categorySlug)}
                      categoryName={category.name}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <DataComingSoon categoryName={category.name} />
          )}
        </div>
      </div>
    </div>
  );
}

function NoProductsMatchingFilters() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[6px] border border-[#dcdcdc] bg-white py-12 text-center">
      <div className="mb-4 rounded-full bg-zinc-100 p-4">
        <Search className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">
        Keine Produkte gefunden
      </h3>
      <p className="max-w-sm text-[13px] text-zinc-500">
        Wir konnten keine Produkte mit den aktuellen Filtern finden. Bitte passe
        deine Filter an.
      </p>
    </div>
  );
}

function DataComingSoon({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-zinc-100 p-6">
        <Info className="h-12 w-12 text-zinc-400" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-zinc-900">Daten folgen</h2>
      <p className="max-w-md text-[14px] text-zinc-500">
        Wir aggregieren derzeit Preisdaten für diese Kategorie. Bitte schaue
        später für die besten Angebote für{" "}
        <span className="font-medium text-zinc-700">{categoryName}</span>{" "}
        vorbei.
      </p>
    </div>
  );
}
