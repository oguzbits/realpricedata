"use client"

import Link from "next/link"
import { useState } from "react"
import { ProductUIModel } from "@/lib/amazon-api"
import { useCountry } from "@/hooks/use-country"
import { getCountryByCode } from "@/lib/countries"
import { ProductCard } from "@/components/product-card"

interface PriceDropsProps {
  products: (ProductUIModel & { dropPercentage: number, oldPrice: number })[]
}

export function PriceDrops({ products }: PriceDropsProps) {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily")
  const { country } = useCountry()
  const countryConfig = getCountryByCode(country)

  // Filter products based on period (in a real app, this would be a real filter)
  const filteredProducts = products.sort((a, b) => 
    period === "daily" ? b.dropPercentage - a.dropPercentage : a.dropPercentage - b.dropPercentage
  ).slice(0, 5)

  // Extract numeric price per unit for comparison
  const productsWithUnitValue = filteredProducts.map(p => {
    const match = p.pricePerUnit?.match(/[\d.]+/);
    return {
      ...p,
      unitValue: match ? parseFloat(match[0]) : Infinity
    };
  });

  const minUnitValue = Math.min(...productsWithUnitValue.map(p => p.unitValue));
  const avgUnitValue = productsWithUnitValue.reduce((acc, p) => acc + p.unitValue, 0) / productsWithUnitValue.length;

  return (
    <section className="mb-12">
      <div className="mb-6 border-b border-border pb-4">
        <div className="mb-4">
          <Link href={`/${country}/categories`} className="group">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-primary transition-all inline-flex items-center gap-2">
              Top Amazon Price Drops <span className="text-foreground transition-transform group-hover:translate-x-1">→</span>
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            The products below have seen significant price drops since the last update. Save big by choosing these vetted deals.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-5 py-2 text-xs font-black rounded-xl border transition-all duration-300 cursor-pointer ${
              period === "daily" 
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)]" 
                : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            Daily Drops
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-5 py-2 text-xs font-black rounded-xl border transition-all duration-300 cursor-pointer ${
              period === "weekly" 
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)]" 
                : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            Weekly Drops
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productsWithUnitValue.map((product) => {
          let badgeText = undefined;
          if (product.unitValue === minUnitValue && minUnitValue !== Infinity) {
            badgeText = "Best Price";
          } else if (product.unitValue < avgUnitValue * 0.85 && product.unitValue !== Infinity) {
            badgeText = "Good Deal";
          }
          
          return (
            <ProductCard
              key={product.asin}
              title={product.title}
              price={product.price.amount}
              oldPrice={product.oldPrice}
              currency={countryConfig?.currency || "USD"}
              url={product.url}
              pricePerUnit={product.pricePerUnit}
              countryCode={country}
              badgeText={badgeText}
              condition="New"
            />
          );
        })}
      </div>
    </section>
  );
}
