/**
 * Idealo Product Carousel Component
 *
 * Reusable product carousel section for bestsellers, new products, etc.
 * Uses the existing IdealoProductCard component for individual cards.
 *
 * Based on Idealo's bestseller/newProducts modules.
 */

"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { IdealoProductCard } from "@/components/landing/IdealoProductCard";

export interface CarouselProduct {
  title: string;
  price: number;
  slug: string;
  image?: string;
  rating?: number;
  ratingCount?: number;
  badgeText?: string;
}

interface IdealoProductCarouselProps {
  title: string;
  products: CarouselProduct[];
  className?: string;
}

export function IdealoProductCarousel({
  title,
  products,
  className,
}: IdealoProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 240; // Card width + gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollState, 300);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("cn-productCarousel", "mb-8", className)}>
      {/* Section Header */}
      <div className="cn-productCarousel__header mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#2d2d2d]">{title}</h2>

        {/* Scroll Controls */}
        <div className="cn-productCarousel__controls flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded border border-[#b4b4b4]",
              "transition-colors",
              canScrollLeft
                ? "bg-white text-[#2d2d2d] hover:bg-[#f5f5f5]"
                : "cursor-not-allowed bg-[#f5f5f5] text-[#b4b4b4]",
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded border border-[#b4b4b4]",
              "transition-colors",
              canScrollRight
                ? "bg-white text-[#2d2d2d] hover:bg-[#f5f5f5]"
                : "cursor-not-allowed bg-[#f5f5f5] text-[#b4b4b4]",
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Product Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollState}
        className={cn(
          "cn-productCarousel__container",
          "scrollbar-hide flex gap-4 overflow-x-auto",
          "scroll-smooth",
          "-mx-4 px-4", // Extend beyond container for edge cards
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <IdealoProductCard
            key={product.slug}
            title={product.title}
            price={product.price}
            slug={product.slug}
            image={product.image}
            rating={product.rating}
            ratingCount={product.ratingCount}
            badgeText={product.badgeText}
          />
        ))}
      </div>
    </div>
  );
}
