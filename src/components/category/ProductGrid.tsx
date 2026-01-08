"use client";

import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { LocalizedProduct } from "@/lib/server/category-products";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface ProductGridProps {
  products: LocalizedProduct[];
  countryCode: CountryCode;
}

export function ProductGrid({ products, countryCode }: ProductGridProps) {
  const countryConfig = getCountryByCode(countryCode);

  // Format currency locally in the client component
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id || product.slug}
          href={`/p/${product.slug}`}
          className={cn(
            "group relative flex flex-col overflow-hidden rounded-[6px] border border-[#dcdcdc] bg-white no-underline transition-all hover:border-zinc-400 hover:shadow-lg",
          )}
        >
          {/* Image */}
          <div className="relative aspect-square w-full bg-white p-4">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-300">
                <span className="text-sm">Kein Bild</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-3 pt-0">
            {/* Title */}
            <h3 className="mb-1 line-clamp-2 text-[12px] leading-tight font-bold text-zinc-900 group-hover:text-[#0066cc] sm:text-[13px]">
              {product.title}
            </h3>

            {/* Specs */}
            <p className="mb-2 line-clamp-1 text-[10px] text-zinc-500 sm:text-[11px]">
              {product.capacity} {product.capacityUnit} • {product.formFactor}
            </p>

            {/* Rating */}
            <div className="mb-2 flex items-center gap-1 text-[10px]">
              <span className="font-semibold text-zinc-600">Note ∅ 1,5</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-2.5 w-2.5 fill-[#f97316] text-[#f97316]"
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-auto flex items-baseline gap-1">
              <span className="text-[10px] font-semibold text-zinc-500">
                ab
              </span>
              <span className="text-[15px] font-bold text-[#f97316] sm:text-[16px]">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Produktdetails link */}
            <div className="mt-1.5 text-[10px] font-semibold text-[#0066cc]">
              Produktdetails
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
