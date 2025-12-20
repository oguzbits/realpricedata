"use client"

import { Badge } from "@/components/ui/badge"
import { useCountry } from "@/hooks/use-country"
import { getCountryByCode } from "@/lib/countries"
import { ProductCard } from "@/components/product-card"
import { getAllProducts, getAffiliateRedirectPath, type Product } from "@/lib/product-registry"



type ProductWithDiscount = Product & {
  discount: number
}

// Calculate discount percentage based on market average or typical retail price
const calculateDiscount = (product: Product): number => {
  // Typical market prices per unit (TB for storage, GB for RAM)
  const marketPrices: Record<Product['technology'], number> = {
    'SSD': 120, // Average $/TB
    'HDD': 25,  // Average $/TB
    'SAS': 30,  // Average $/TB
    'DDR4': 10, // Average $/GB
    'DDR5': 15  // Average $/GB
  }
  
  const marketPrice = marketPrices[product.technology]
  const currentPrice = (product.technology === 'DDR4' || product.technology === 'DDR5')
    ? (product.pricePerGB || 0)
    : (product.pricePerTB || 0)

  if (marketPrice === 0 || currentPrice === 0) return 0
  
  const discount = Math.round(((marketPrice - currentPrice) / marketPrice) * 100)
  return Math.max(0, Math.min(discount, 99)) // Clamp between 0-99%
}

// Get the top 3 deals based on discount percentage
const getTopDeals = (): ProductWithDiscount[] => {
  const allProducts = getAllProducts()
  return allProducts
    .map(product => ({
      ...product,
      discount: calculateDiscount(product)
    }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 3)
}

export function HeroDealCards() {
  const { country } = useCountry()
  const countryConfig = getCountryByCode(country)

  const highlightedDeals = getTopDeals()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {highlightedDeals.map((product) => {
          const isRAM = product.category === 'ram'
          const pricePerUnitValue = isRAM ? product.pricePerGB : product.pricePerTB
          const unit = isRAM ? 'GB' : 'TB'
          
          return (
            <ProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              oldPrice={product.price * (1 + product.discount / 100)}
              currency={countryConfig?.currency || "USD"}
              url={getAffiliateRedirectPath(product.slug)}
              pricePerUnit={pricePerUnitValue ? `${countryConfig?.currency || "$"}${pricePerUnitValue.toFixed(2)}/${unit}` : undefined}
              countryCode={country}
              badgeText={product.condition === 'New' ? "Good Deal" : product.condition}
              badgeColor={product.condition === 'New' ? "blue" : "amber"}
              discountPercentage={product.discount}
            />
          )
        })}
      </div>
  )
}
