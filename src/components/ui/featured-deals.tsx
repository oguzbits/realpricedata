"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, HardDrive } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Deal {
  id: string
  name: string
  category: string
  categorySlug: string
  parentSlug: string
  originalPrice: number
  bestUnitPrice: number
  unitLabel: string
  savings: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  badge?: string
}

const deals: Deal[] = [
  {
    id: "101",
    name: "SAMSUNG 990 PRO SSD 2TB NVMe M.2 PCIe Gen4",
    category: "Hard Drives & SSDs",
    categorySlug: "hard-drives",
    parentSlug: "electronics",
    originalPrice: 189.99,
    bestUnitPrice: 94.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted",
    badge: "Most Viewed"
  },
  {
    id: "102",
    name: "Seagate Exos X18 18TB Enterprise HDD",
    category: "Hard Drives & SSDs",
    categorySlug: "hard-drives",
    parentSlug: "electronics",
    originalPrice: 249.99,
    bestUnitPrice: 13.89,
    unitLabel: "TB",
    savings: 94, // Simplified savings representation
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted",
    badge: "Best Value"
  },
  {
    id: "103",
    name: "WD_BLACK 2TB SN850X NVMe Internal Gaming SSD",
    category: "Hard Drives & SSDs",
    categorySlug: "hard-drives",
    parentSlug: "electronics",
    originalPrice: 189.99,
    bestUnitPrice: 94.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted"
  }
]

export function FeaturedDeals({ country = "us" }: { country?: string }) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Show all 3 deals
  const getVisibleDeals = () => {
    return deals.slice(0, 3) 
  }

  return (
    <section 
      id="top-value-opportunities"
      className="container px-4 mx-auto py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">
          Live Market Data
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Top Value Opportunities</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We've analyzed thousands of products to find these outliers—items with the absolute lowest price per unit available right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-live="polite" aria-atomic="true">
        {getVisibleDeals().map((deal, idx) => (
          <Link 
            key={`${deal.id}-${idx}`} 
            className="no-underline block h-full" 
            href={`/${country}/${deal.parentSlug}/${deal.categorySlug}`}
            aria-label={`${deal.name} in ${deal.category}, $${deal.bestUnitPrice} per ${deal.unitLabel}`}
          >
            <Card className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
              {deal.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`border-0 text-white shadow-lg text-xs font-semibold px-3 py-1 ${deal.badge === 'Best Value' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                    {deal.badge}
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <deal.icon className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-2 py-1 bg-muted rounded-full w-fit">{deal.category}</p>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {deal.name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-auto">
                    <div className="flex items-baseline justify-between mb-1">
                       <span className="text-sm text-muted-foreground">Price per {deal.unitLabel}</span>
                    </div>
                    <div className="flex items-end gap-2">
                       <p className="text-3xl font-bold text-foreground">
                        ${deal.bestUnitPrice}
                      </p>
                      <span className="text-sm font-medium text-muted-foreground pb-1">/{deal.unitLabel}</span>
                    </div>
                    {deal.savings > 0 && (
                       <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                         <TrendingDown className="h-3 w-3 mr-1" />
                         Significant outlier detected
                       </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                   View details <span className="ml-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
