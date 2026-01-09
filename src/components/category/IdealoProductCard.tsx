/**
 * Idealo Product Card - sr-resultItemTile
 *
 * Based on actual Idealo HTML structure:
 * - sr-resultItemTile__imageSection
 * - sr-resultItemTile__infoWrapper
 * - sr-productSummary__title
 * - sr-productSummary__description
 * - sr-detailedPriceInfo
 * - sr-productInformationTrigger
 */

"use client";

import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { LocalizedProduct } from "@/lib/server/category-products";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface IdealoResultItemTileProps {
  product: LocalizedProduct;
  countryCode: CountryCode;
  viewMode: string;
}

export function IdealoProductCard({
  product,
  countryCode,
  viewMode,
}: IdealoResultItemTileProps) {
  const countryConfig = getCountryByCode(countryCode);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: countryConfig?.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Build summary
  const summaryParts = [
    product.capacity && product.capacityUnit
      ? `${product.capacity} ${product.capacityUnit}`
      : null,
    product.formFactor,
  ].filter(Boolean);

  // Grid view (default)
  if (viewMode === "grid") {
    return (
      <Link
        href={`/p/${product.slug}`}
        className={cn(
          "sr-resultItemTile",
          // Idealo uses negative margins for overlapping borders
          "-mr-px -mb-px",
          "flex flex-col",
          "border border-[#b4b4b4]",
          "bg-white",
          "no-underline",
        )}
      >
        {/* sr-resultItemTile__imageSection */}
        <div className="sr-resultItemTile__imageSection relative flex h-[140px] items-center justify-center bg-white p-[15px]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] text-sm text-[#767676]">
              Kein Bild
            </div>
          )}
        </div>

        {/* sr-resultItemTile__infoWrapper */}
        <div className="sr-resultItemTile__infoWrapper flex flex-1 flex-col gap-2 p-[15px] pt-0">
          {/* sr-productSummary__title */}
          <h3 className="sr-productSummary__title m-0 line-clamp-3 text-[14px] leading-[18px] font-bold hyphens-auto text-[#2d2d2d]">
            {product.title}
          </h3>

          {/* sr-productSummary__description */}
          {summaryParts.length > 0 && (
            <p className="sr-productSummary__description m-0 line-clamp-2 text-[12px] leading-[18px] text-[#2d2d2d]">
              {summaryParts.join(" • ")}
            </p>
          )}

          {/* Rating */}
          <div className="sr-resultItemTile__rating flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-[#f97316] text-[#f97316]"
              />
            ))}
            <span className="text-[13px] text-[#767676]">∅ 1,5</span>
          </div>

          {/* sr-detailedPriceInfo - pushed to bottom */}
          <div className="sr-detailedPriceInfo mt-auto flex items-baseline gap-1">
            <span className="text-[20px] text-[#767676]">ab</span>
            <span className="text-[20px] font-bold text-[#f97316]">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* sr-productInformationTrigger */}
          <div className="sr-productInformationTrigger flex items-center gap-0.5 text-[13px] font-bold text-[#0771d0]">
            <ChevronRight className="h-4 w-4" />
            <span>Produktdetails</span>
          </div>
        </div>
      </Link>
    );
  }

  // List view
  return (
    <Link
      href={`/p/${product.slug}`}
      className={cn(
        "sr-resultItemTile sr-resultItemTile--list",
        "-mb-px",
        "flex flex-row items-stretch",
        "border border-[#b4b4b4]",
        "bg-white",
        "no-underline",
      )}
    >
      {/* Image - fixed width in list view */}
      <div className="sr-resultItemTile__imageSection relative flex h-[120px] w-[120px] shrink-0 items-center justify-center bg-white p-2">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-2"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] text-sm text-[#767676]">
            Kein Bild
          </div>
        )}
      </div>

      {/* Content - flex grow */}
      <div className="sr-resultItemTile__infoWrapper flex flex-1 items-center gap-4 p-3">
        {/* Left: Title + Description */}
        <div className="flex-1">
          <h3 className="sr-productSummary__title m-0 text-[14px] leading-[18px] font-bold text-[#2d2d2d]">
            {product.title}
          </h3>
          {summaryParts.length > 0 && (
            <p className="sr-productSummary__description m-0 mt-1 text-[12px] text-[#767676]">
              {summaryParts.join(" • ")}
            </p>
          )}
          {/* Rating in list */}
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3 w-3 fill-[#f97316] text-[#f97316]" />
            ))}
            <span className="text-[12px] text-[#767676]">∅ 1,5</span>
          </div>
        </div>

        {/* Middle: Price */}
        <div className="sr-detailedPriceInfo flex flex-col items-end">
          <span className="text-[14px] text-[#767676]">ab</span>
          <span className="text-[24px] font-bold text-[#f97316]">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Right: CTA */}
        <div className="sr-productInformationTrigger flex items-center gap-0.5 text-[14px] font-bold text-[#0771d0]">
          <span>Produktdetails</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
