"use client";

import { Carousel, CarouselRef } from "@/components/Carousel";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/SectionHeader";
import { Product } from "@/types";
import { getCountryByCode } from "@/lib/countries";
import { calculateProductBadges, parseUnitValue } from "@/lib/utils/products";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  country: string;
  children?: React.ReactNode;
  productCardProps?: Partial<React.ComponentProps<typeof ProductCard>>;
  priorityIndices?: number[];
}

export function ProductSection({
  title,
  description,
  products,
  country,
  children,
  productCardProps,
  priorityIndices,
}: ProductSectionProps) {
  const countryConfig = getCountryByCode(country);
  const carouselRef = useRef<CarouselRef>(null);
  const [scrollState, setScrollState] = React.useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const processedProducts = calculateProductBadges(
    products.map((p) => ({
      ...p,
      unitValue: parseUnitValue(p.pricePerUnit),
    })),
  );

  return (
    <section className={cn("mb-8 md:mb-10")}>
      {/* Simplified header: no categories select, no link on title */}
      <SectionHeader
        title={title}
        description={description}
        onScrollLeft={() => carouselRef.current?.scrollLeft()}
        onScrollRight={() => carouselRef.current?.scrollRight()}
        canScrollLeft={scrollState.canScrollLeft}
        canScrollRight={scrollState.canScrollRight}
      />

      {children}

      <Carousel ref={carouselRef} onScrollStateChange={setScrollState}>
        {processedProducts.map((product, index) => (
          <ProductCard
            key={product.asin}
            title={product.title}
            price={product.price.amount}
            currency={countryConfig?.currency || "USD"}
            slug={product.slug}
            image={product.image}
            pricePerUnit={product.pricePerUnit}
            countryCode={country}
            badgeText={product.badgeText}
            priority={priorityIndices?.includes(index)}
            {...productCardProps}
          />
        ))}
      </Carousel>
    </section>
  );
}
