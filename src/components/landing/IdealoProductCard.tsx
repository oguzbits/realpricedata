"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatting";
import Image from "next/image";
import Link from "next/link";

interface IdealoProductCardProps {
  title: string;
  price: number;
  currency?: string;
  slug: string;
  image?: string;
  rating?: number; // Community Rating (Stars)
  ratingCount?: number; // Community Review Count
  testRating?: number; // Professional "Note" (e.g. 1.0 - 6.0)
  testCount?: number; // Number of tests
  badgeText?: string;
  categoryName?: string;
  discountRate?: number;
  isBestseller?: boolean;
  energyLabel?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  pricePerUnit?: number;
  capacityUnit?: string;
}

export function IdealoProductCard({
  title,
  price,
  currency = "EUR",
  slug,
  image,
  rating,
  ratingCount,
  testRating,
  testCount,
  badgeText,
  categoryName,
  discountRate,
  isBestseller,
  energyLabel,
  pricePerUnit,
  capacityUnit,
}: IdealoProductCardProps) {
  return (
    <Link
      href={`/p/${slug}`}
      className="group relative flex h-[380px] w-[224px] shrink-0 flex-col bg-white p-4 no-underline transition-shadow hover:shadow-lg"
      style={{ border: "1px solid rgb(220, 220, 220)" }}
    >
      {/* Badges Area - top left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discountRate && discountRate > 0 && (
          <div className="rounded-sm bg-[#ff6600] px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discountRate}%
          </div>
        )}
        {badgeText && (!discountRate || discountRate === 0) && (
          <div className="rounded-sm bg-[#ff6600] px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            {badgeText}
          </div>
        )}
        {energyLabel && (
          <div
            className={cn(
              "flex h-[18px] w-[32px] items-center justify-center rounded-sm text-[10px] font-bold text-white shadow-sm",
              energyLabel === "A" && "bg-[#00a651]",
              energyLabel === "B" && "bg-[#4cb749]",
              energyLabel === "C" && "bg-[#c4d92e]",
              energyLabel === "D" && "bg-[#ffed00]",
              energyLabel === "E" && "bg-[#fbb034]",
              energyLabel === "F" && "bg-[#f26522]",
              energyLabel === "G" && "bg-[#ed1c24]",
            )}
            title={`Energieeffizienzklasse ${energyLabel}`}
          >
            {energyLabel}
          </div>
        )}
      </div>

      {/* Wishlist heart - top right */}
      <button
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#ff6600]"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-label="Zur Merkliste hinzufügen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative mb-3 h-[140px] w-full">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain"
            sizes="224px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
            <span className="text-xs italic">Kein Bild</span>
          </div>
        )}
      </div>

      {/* Category Info */}
      <div className="mb-1 flex items-center gap-1.5 overflow-hidden">
        {!!isBestseller && (
          <div className="shrink-0 rounded-[2px] bg-[#0066cc] px-1 py-0.5 text-[9px] font-bold tracking-tighter text-white uppercase">
            Bestseller
          </div>
        )}
        {categoryName && (
          <span
            className={cn(
              "truncate text-[11px] text-gray-500",
              isBestseller && "font-medium",
            )}
          >
            in {categoryName}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-3 min-h-[54px] text-[14px] leading-tight font-semibold text-gray-900 group-hover:text-[#0066cc]">
        {title}
      </h3>

      {/* Professional Rating (Note) */}
      {typeof testRating === "number" && testRating > 0 && (
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[#00a651]">
          <span>Note Ø {testRating.toFixed(1).replace(".", ",")}</span>
          {testCount && (
            <span className="text-[10px] font-normal text-gray-400">
              ({testCount} Test{testCount === 1 ? "" : "s"})
            </span>
          )}
        </div>
      )}

      {/* Community Rating (Stars) */}
      {typeof rating === "number" && rating > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-[11px]">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => {
              const fillPercent = Math.max(
                0,
                Math.min(100, (rating - (i - 1)) * 100),
              );
              return (
                <div key={i} className="relative h-3 w-3">
                  {/* Background Star */}
                  <svg
                    className="absolute inset-0 fill-gray-200"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  {/* Foreground Star */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPercent}%` }}
                  >
                    <svg className="h-3 w-3 fill-[#ff6600]" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
          {ratingCount && (
            <span className="font-normal text-gray-400">({ratingCount})</span>
          )}
        </div>
      )}

      {/* Price section */}
      <div className="mt-auto flex items-baseline gap-1">
        <span className="text-[12px] font-medium text-gray-500">ab</span>
        <span className="text-[20px] font-bold text-[#ff6600]">
          {formatCurrency(price, "de")}
        </span>
      </div>
    </Link>
  );
}
