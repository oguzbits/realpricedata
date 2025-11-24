"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock categories data
const CATEGORIES = [
  { name: "Hard Drives & SSDs", slug: "storage", icon: "💾" },
  { name: "Protein Powder", slug: "protein-powder", icon: "💪" },
  { name: "Laundry Detergent", slug: "laundry-detergent", icon: "🧴" },
  { name: "Diapers", slug: "diapers", icon: "👶" },
  { name: "Batteries", slug: "batteries", icon: "🔋" },
]

// Mock products data (in real app, this would come from API)
const MOCK_PRODUCTS = [
  { name: "Seagate 2TB External HDD", category: "storage", asin: "B07VTWX8MN" },
  { name: "Samsung 1TB Internal SSD", category: "storage", asin: "B08QBJ2YMG" },
  { name: "Optimum Nutrition Whey Protein", category: "protein-powder", asin: "B000QSNYGI" },
  { name: "Tide Liquid Laundry Detergent", category: "laundry-detergent", asin: "B01NBCU98B" },
  { name: "Duracell AA Batteries 24 Pack", category: "batteries", asin: "B00MNV8E0C" },
]

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  // Filter categories and products based on query
  const filteredCategories = CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) // Limit to 5 results

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  // Reset query when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`)
    onOpenChange(false)
  }

  const handleProductClick = (category: string) => {
    router.push(`/categories/${category}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search categories and products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base px-2 py-1.5 h-auto flex-1"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">⌘K</kbd> or{" "}
            <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Ctrl+K</kbd> to toggle
          </p>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-6 space-y-6">
          {query === "" ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Start typing to search...</p>
            </div>
          ) : (
            <>
              {/* Categories */}
              {filteredCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {category.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Category</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          View
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {filteredProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                    Products
                  </h3>
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.asin}
                        onClick={() => handleProductClick(product.category)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xl">
                          {CATEGORIES.find(c => c.slug === product.category)?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            in {CATEGORIES.find(c => c.slug === product.category)?.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-auto shrink-0">
                          View
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {filteredCategories.length === 0 && filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-2">Try searching for categories like &quot;batteries&quot; or products</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
