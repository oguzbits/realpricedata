"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { IdealoProductCard } from "./IdealoProductCard";

interface Product {
  title: string;
  price: number;
  slug: string;
  image?: string;
  badgeText?: string;
}

interface IdealoProductCarouselProps {
  title: string;
  products: Product[];
}

export function IdealoProductCarousel({
  title,
  products,
}: IdealoProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      return () => el.removeEventListener("scroll", updateScrollState);
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 480; // ~2 cards
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-gray-900">{title}</h2>
      </div>

      {/* Carousel container with hover detection */}
      <div
        className="group/carousel-nav relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left arrow - inside carousel, visible on hover */}
        <button
          onClick={() => scroll("left")}
          className={`absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-600/80 text-white shadow-lg transition-all hover:bg-gray-700/90 ${
            canScrollLeft && isHovered
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <IdealoProductCard
              key={product.slug}
              title={product.title}
              price={product.price}
              slug={product.slug}
              image={product.image}
              badgeText={product.badgeText}
            />
          ))}
        </div>

        {/* Right arrow - inside carousel, visible on hover */}
        <button
          onClick={() => scroll("right")}
          className={`absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-600/80 text-white shadow-lg transition-all hover:bg-gray-700/90 ${
            canScrollRight && isHovered
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
