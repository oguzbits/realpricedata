"use client";

import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { LocalizedProduct } from "@/lib/server/category-products";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";

interface IdealoProductCardProps {
  product: LocalizedProduct;
  countryCode: CountryCode;
}

export function IdealoProductCard({
  product,
  countryCode,
}: IdealoProductCardProps) {
  const countryConfig = getCountryByCode(countryCode);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group relative -mr-px -mb-px flex flex-col border border-[#b4b4b4] bg-white no-underline"
    >
      {/* Image container - height with max constraint */}
      <div className="relative flex h-[140px] items-center justify-center bg-white p-[15px]">
        <div className="relative h-full w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-300">
              <span className="text-base">Kein Bild</span>
            </div>
          )}
        </div>
      </div>

      {/* Content - exact Idealo styling */}
      <div className="flex flex-1 flex-col gap-[8px] p-[15px] pt-0">
        {/* Title - exact Idealo CSS */}
        <h3
          className="text-[#2d2d2d]"
          style={{
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "18px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            hyphens: "auto",
            maxHeight: "72px",
          }}
        >
          {product.title}
        </h3>

        {/* Product Summary - 3 lines with exact Idealo CSS */}
        <p
          className="mt-[5px] text-[#2d2d2d]"
          style={{
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "18px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 0,
            position: "relative",
          }}
        >
          {product.capacity} {product.capacityUnit} • {product.formFactor} •{" "}
          {product.title}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-[6px]">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="h-[14px] w-[14px] fill-[#f97316] text-[#f97316]"
              />
            ))}
          </div>
          <span className="text-[13px] text-[#666]">∅ 1,5</span>
        </div>

        {/* Price - pushed to bottom */}
        <div className="mt-auto flex items-baseline gap-[4px]">
          <span className="text-[#666]" style={{ fontSize: "20px" }}>
            ab
          </span>
          <span
            className="font-bold text-[#f97316]"
            style={{ fontSize: "20px" }}
          >
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Produktdetails link - bold with expand icon */}
        <div className="flex items-center gap-1 text-[13px] font-bold text-[#0066cc]">
          <ChevronRight className="h-4 w-4 text-[#0066cc]" />
          Produktdetails
        </div>
      </div>
    </Link>
  );
}
