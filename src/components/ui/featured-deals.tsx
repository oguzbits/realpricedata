"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Zap, HardDrive, Dumbbell, Droplets, Baby, Battery } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Deal {
  id: string
  name: string
  category: string
  categorySlug: string
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
    category: "Storage",
    categorySlug: "storage",
    originalPrice: 189.99,
    bestUnitPrice: 94.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted",
    badge: "Best Seller"
  },
  {
    id: "102",
    name: "Seagate Exos X18 18TB Enterprise HDD",
    category: "Storage",
    categorySlug: "storage",
    originalPrice: 249.99,
    bestUnitPrice: 13.89,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted"
  },
  {
    id: "103",
    name: "WD_BLACK 2TB SN850X NVMe Internal Gaming SSD",
    category: "Storage",
    categorySlug: "storage",
    originalPrice: 189.99,
    bestUnitPrice: 94.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted"
  },
  {
    id: "104",
    name: "Crucial MX500 2TB 3D NAND SATA 2.5 Inch Internal SSD",
    category: "Storage",
    categorySlug: "storage",
    originalPrice: 179.99,
    bestUnitPrice: 89.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted"
  },
  {
    id: "105",
    name: "SanDisk 1TB Extreme Portable SSD",
    category: "Storage",
    categorySlug: "storage",
    originalPrice: 119.99,
    bestUnitPrice: 119.99,
    unitLabel: "TB",
    savings: 0,
    icon: HardDrive,
    iconColor: "from-muted/50 to-muted"
  }
]

export function FeaturedDeals() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const visibleDeals = 3

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isHovered])

  const getVisibleDeals = () => {
    const visible = []
    for (let i = 0; i < visibleDeals; i++) {
      visible.push(deals[(currentIndex + i) % deals.length])
    }
    return visible
  }

  return (
    <section 
      className="container px-4 mx-auto py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4 border-zinc-200 text-zinc-900 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
          Live Data
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Top Value Opportunities</h2>
        <p className="text-muted-foreground">Highest savings by unit price analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-live="polite" aria-atomic="true">
        {getVisibleDeals().map((deal, idx) => (
          <Link 
            key={`${deal.id}-${idx}`} 
            className="no-underline" 
            href={`/categories/${deal.categorySlug}`}
            aria-label={`${deal.name} in ${deal.category}, $${deal.bestUnitPrice} per ${deal.unitLabel}, ${deal.savings}% savings`}
          >
            <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-xl border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
              {deal.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-blue-700 dark:bg-blue-600 border-0 text-white shadow-lg text-xs font-semibold">
                    {deal.badge}
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <deal.icon className="h-6 w-6 text-foreground/70" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{deal.category}</p>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {deal.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ${deal.bestUnitPrice}
                        <span className="text-sm font-normal text-muted-foreground">/{deal.unitLabel}</span>
                      </p>
                    </div>
                    
                    {deal.savings > 0 && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50 border-emerald-200 dark:border-emerald-800 px-3 py-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {deal.savings}%
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
                      View all {deal.category} deals →
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6" role="group" aria-label="Carousel navigation">
        {deals.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className="relative p-3 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
          >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? "w-6 bg-blue-600 dark:bg-blue-500" 
                : "w-1.5 bg-zinc-300 dark:bg-zinc-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-400"
            }`} />
          </button>
        ))}
      </div>
    </section>
  )
}
