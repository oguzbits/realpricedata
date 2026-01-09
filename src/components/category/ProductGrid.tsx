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
    <div className="-mx-px grid auto-rows-fr grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id || product.slug}
          href={`/p/${product.slug}`}
          className={cn(
            "group relative -mr-px -mb-px flex flex-col border border-[#b4b4b4] bg-white no-underline transition-shadow hover:z-10 hover:shadow-lg",
          )}
        >
          {/* Image - using aspect ratio for natural sizing */}
          <div className="relative aspect-4/3 w-full bg-white">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-3"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-300">
                <span className="text-base">Kein Bild</span>
              </div>
            )}
          </div>

          {/* Content - flex-1 to push price to bottom */}
          <div className="flex flex-1 flex-col p-4">
            {/* Title - 14px for readability */}
            <h3 className="mb-1.5 line-clamp-2 text-[14px] leading-snug font-normal text-[#0066cc] group-hover:underline">
              {product.title}
            </h3>

            {/* Specs - 13px */}
            <p className="mb-2 line-clamp-1 text-[13px] text-zinc-500">
              {product.capacity} {product.capacityUnit} • {product.formFactor}
            </p>

            {/* Rating - 12px */}
            <div className="mb-3 flex items-center gap-1.5 text-[12px]">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3 w-3 fill-[#f97316] text-[#f97316]"
                  />
                ))}
              </div>
              <span className="text-zinc-500">∅ 1,5</span>
            </div>

            {/* Price - pushed to bottom with mt-auto */}
            <div className="mt-auto flex items-baseline gap-1">
              <span className="text-[13px] text-zinc-400">ab</span>
              <span className="text-[18px] font-bold text-[#f97316]">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Produktdetails link - 13px */}
            <div className="mt-2 text-[13px] text-[#0066cc] group-hover:underline">
              Produktdetails
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
