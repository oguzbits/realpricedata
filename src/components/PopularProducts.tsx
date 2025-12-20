"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useCountry } from "@/hooks/use-country"
import { getCountryByCode } from "@/lib/countries"
import { ProductCard } from "@/components/product-card"
import { ProductUIModel } from "@/lib/amazon-api"

interface PopularProductsProps {
  products: ProductUIModel[]
}

export function PopularProducts({ products }: PopularProductsProps) {
  const { country } = useCountry()
  const countryConfig = getCountryByCode(country)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "en-US", {
      style: "currency",
      currency: countryConfig?.currency || "USD",
    }).format(value)
  }

  // Extract numeric price per unit for comparison
  const productsWithUnitValue = products.map(p => {
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
      <div className="mb-6 border-b border-border pb-2">
        <Link href={`/${country}/categories`} className="group">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-primary transition-all inline-flex items-center gap-2">
            Popular Products <span className="text-foreground transition-transform group-hover:translate-x-1">→</span>
          </h2>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          Check out these recently popular deals. See what other informed users have been buying recently!
        </p>
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
              oldPrice={product.price.amount * 1.15}
              currency={countryConfig?.currency || "USD"}
              url={product.url}
              pricePerUnit={product.pricePerUnit}
              countryCode={country}
              badgeText={badgeText}
            />
          );
        })}
      </div>
    </section>
  );
}
