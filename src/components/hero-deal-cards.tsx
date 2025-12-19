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
  // Typical market prices per TB for different technologies
  const marketPrices = {
    'SSD': 120, // Average $/TB for SSDs
    'HDD': 25,  // Average $/TB for HDDs
    'SAS': 30   // Average $/TB for SAS
  }
  
  const marketPrice = marketPrices[product.technology]
  const discount = Math.round(((marketPrice - product.pricePerTB) / marketPrice) * 100)
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const highlightedDeals = getTopDeals()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {highlightedDeals.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            price={product.price}
            oldPrice={product.price * (1 + product.discount / 100)}
            currency={countryConfig?.currency || "USD"}
            url={getAffiliateRedirectPath(product.slug)}
            pricePerUnit={`${countryConfig?.currency || "$"}${product.pricePerTB.toFixed(2)}/TB`}
            countryCode={country}
            badgeText={product.condition === 'New' ? "Good Deal" : product.condition}
            badgeColor={product.condition === 'New' ? "blue" : "amber"}
            discountPercentage={product.discount}
          />
        ))}
      </div>
  )
}
