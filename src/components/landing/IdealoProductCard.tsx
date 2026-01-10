"use client";

import { formatCurrency } from "@/lib/utils/formatting";
import Image from "next/image";
import Link from "next/link";

interface IdealoProductCardProps {
  title: string;
  price: number;
  currency?: string;
  slug: string;
  image?: string;
  rating?: number;
  ratingCount?: number;
  badgeText?: string;
}

export function IdealoProductCard({
  title,
  price,
  currency = "EUR",
  slug,
  image,
  rating = 1.5,
  ratingCount = 8,
  badgeText,
}: IdealoProductCardProps) {
  return (
    <Link
      href={`/p/${slug}`}
      className="group relative flex h-[327px] w-[224px] shrink-0 flex-col bg-white p-4 no-underline transition-shadow hover:shadow-lg"
      style={{ border: "1px solid rgb(220, 220, 220)" }}
    >
      {/* Badge - top left */}
      {badgeText && (
        <div className="absolute top-3 left-3 z-10 rounded bg-[#ff6600] px-2 py-0.5 text-[11px] font-bold text-white">
          {badgeText}
        </div>
      )}

      {/* Image - takes up top portion */}
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
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
            <span className="text-xs">Kein Bild</span>
          </div>
        )}
      </div>

      {/* Title - 16px font */}
      <h3 className="mb-2 line-clamp-2 text-[16px] leading-tight font-semibold text-gray-900 group-hover:text-[#0066cc]">
        {title}
      </h3>

      {/* Rating */}
      <div className="mb-3 flex items-center gap-1.5 text-[12px] text-gray-500">
        <span className="font-medium">
          Note ∅ {rating.toFixed(1).replace(".", ",")}
        </span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              className="h-3.5 w-3.5 fill-[#ff6600]"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
        </div>
        <span className="text-gray-400">{ratingCount}</span>
      </div>

      {/* Price - 20px font at bottom */}
      <div className="mt-auto flex items-baseline gap-1">
        <span className="text-[12px] text-gray-500">ab</span>
        <span className="text-[20px] font-bold text-[#ff6600]">
          {formatCurrency(price, "de")}
        </span>
      </div>
    </Link>
  );
}
