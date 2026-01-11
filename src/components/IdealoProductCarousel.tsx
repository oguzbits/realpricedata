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
      // Scroll by the visible width of the container (page-based scrolling)
      const scrollAmount = container.clientWidth - 48; // Subtract padding
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollState, 300);
    }
  };

  if (products.length === 0) {
    return (
      <div className={cn("cn-productCarousel", "mb-8", className)}>
        <div className="cn-productCarousel__header mb-4">
          <h2 className="text-[20px] font-bold text-[#2d2d2d]">{title}</h2>
        </div>
        <div className="flex items-center justify-center rounded bg-[#f9f9f9] py-12 text-center">
          <p className="text-sm text-[#999]">Keine Produkte verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("cn-productCarousel", "mb-8", className)}>
      {/* Section Header */}
      <div className="cn-productCarousel__header mb-4">
        <h2 className="text-[20px] font-bold text-[#2d2d2d]">{title}</h2>
      </div>

      {/* Product Carousel with Navigation */}
      <div className="group/carousel relative">
        {/* Left Navigation Button */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "absolute top-1/2 left-0 z-10 -translate-y-1/2",
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-[#6b6b6b] text-white hover:bg-[#5a5a5a]",
            "opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100",
            !canScrollLeft && "pointer-events-none opacity-0!",
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right Navigation Button */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "absolute top-1/2 right-0 z-10 -translate-y-1/2",
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-[#6b6b6b] text-white hover:bg-[#5a5a5a]",
            "opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100",
            !canScrollRight && "pointer-events-none opacity-0!",
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className={cn(
            "cn-productCarousel__container",
            "scrollbar-hide flex gap-4 overflow-x-auto",
            "scroll-smooth",
            "px-6", // Padding for buttons
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
    </div>
  );
}
