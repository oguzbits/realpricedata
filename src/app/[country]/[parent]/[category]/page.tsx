"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Filter, Search, Info } from "lucide-react"
import { getCategoryBySlug, getBreadcrumbs } from "@/lib/categories"
import { isValidCountryCode, DEFAULT_COUNTRY, getCountryByCode } from "@/lib/countries"
import { useProductFilters } from "@/hooks/use-product-filters"
import { trackSEO } from "@/lib/analytics"
import { Product } from "@/lib/product-registry"
import { useCategoryProducts } from "@/hooks/use-category-products"

// Extracted Sub-components
import { CategoryHeader } from "@/components/category/CategoryHeader"
import { ProductTable } from "@/components/category/ProductTable"
import { FilterPanel } from "@/components/category/FilterPanel"

export default function CategoryProductsPage() {
  const params = useParams()
  const countryCode = params.country as string
  const categorySlug = params.category as string
  
  // 1. Context & Settings
  const validCountry = isValidCountryCode(countryCode) ? countryCode : DEFAULT_COUNTRY
  const countryConfig = getCountryByCode(validCountry)
  const category = getCategoryBySlug(categorySlug)
  const breadcrumbs = getBreadcrumbs(categorySlug)

  // 2. State & Logic Hooks
  const { filters, setSearch, toggleArrayFilter, setCapacityRange, setSort, clearAllFilters } = useProductFilters()
  const { 
    products, 
    filteredCount, 
    unitLabel, 
    hasProducts 
  } = useCategoryProducts({ category, filters })

  // 3. Analytics
  React.useEffect(() => {
    if (category) {
      trackSEO.categoryView(categorySlug, validCountry)
    }
  }, [categorySlug, validCountry, category])

  // 4. Shared Handlers
  const formatCurrency = (value: number, fractionDigits = 2) => {
    return new Intl.NumberFormat(countryConfig?.locale || 'en-US', {
      style: 'currency',
      currency: countryConfig?.currency || 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  }

  const handleAffiliateClick = (product: Product, index: number) => {
    trackSEO.affiliateClick({
      productName: product.title,
      category: categorySlug,
      country: validCountry,
      price: product.price,
      pricePerUnit: product.pricePerUnit || 0,
      position: index + 1,
    })
  }

  const handleFilterChange = (filterName: string, value: string) => {
    toggleArrayFilter(filterName as any, value)
    trackSEO.filterApplied(filterName, value, categorySlug)
  }

  const handleSort = (key: string) => {
    const effectiveKey = !key ? 'pricePerUnit' : key
    const currentSortBy = !filters.sortBy ? 'pricePerUnit' : filters.sortBy
    const newOrder = currentSortBy === effectiveKey && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    
    setSort(key as any, newOrder as 'asc' | 'desc')
    trackSEO.sortChanged(String(effectiveKey), newOrder, categorySlug)
  }

  // 5. Early Returns
  if (!category) return <CategoryNotFound country={validCountry} />

  // 6. Main Render
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        
        <CategoryHeader 
          category={category}
          countryCode={validCountry}
          breadcrumbs={breadcrumbs}
          productCount={filteredCount}
          searchValue={filters.search}
          onSearchChange={setSearch}
        />

        {/* Action Bar (Mobile Only Search/Filter) */}
        {!hasProducts && <div className="hidden" />} {/* Small hack to maintain spacing if needed */}

        <div className="flex gap-6">
          {hasProducts ? (
            <>
              {/* Desktop Filters */}
              <aside className="hidden lg:block w-60 shrink-0">
                <FilterPanel 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onCapacityChange={setCapacityRange}
                  unitLabel={unitLabel}
                  categorySlug={categorySlug}
                />
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="lg:hidden mb-4 flex justify-end">
                   <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-card">
                        <Filter className="h-4 w-4" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] pt-12">
                      <SheetTitle className="sr-only">Filters</SheetTitle>
                      <FilterPanel 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onCapacityChange={setCapacityRange}
                        unitLabel={unitLabel}
                        categorySlug={categorySlug}
                      />
                    </SheetContent>
                  </Sheet>
                </div>

                {products.length > 0 ? (
                  <ProductTable 
                    products={products}
                    unitLabel={unitLabel}
                    categorySlug={categorySlug}
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onSort={handleSort}
                    formatCurrency={formatCurrency}
                    onAffiliateClick={handleAffiliateClick}
                  />
                ) : (
                  <NoProductsMatchingFilters onClear={clearAllFilters} />
                )}
                
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Prices and availability are subject to change.
                </div>
              </div>
            </>
          ) : (
            <DataComingSoon categoryName={category.name} />
          )}
        </div>
      </div>
    </div>
  )
}

// Internal Helper Components
function CategoryNotFound({ country }: { country: string }) {
  return (
    <div className="container py-12 mx-auto px-4 text-center">
      <div className="py-24">
        <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
        <Button asChild><Link href={`/${country}`}>Browse All Categories</Link></Button>
      </div>
    </div>
  )
}

function NoProductsMatchingFilters({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-card/50">
      <div className="bg-muted/30 p-4 rounded-full mb-4"><Search className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold mb-2">No products found</h3>
      <p className="text-muted-foreground max-w-sm mb-6">We couldn't find any products matching your current filters.</p>
      <Button variant="outline" onClick={onClear}>Clear All Filters</Button>
    </div>
  )
}

function DataComingSoon({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-muted/30 p-6 rounded-full mb-6"><Info className="h-12 w-12 text-muted-foreground" /></div>
      <h2 className="text-2xl font-bold mb-3">Data Coming Soon</h2>
      <p className="text-muted-foreground max-w-md text-lg">
        We are currently aggregating real-time price data for this category. 
        Please check back shortly for the best deals on <span className="font-medium text-foreground">{categoryName}</span>.
      </p>
    </div>
  )
}

