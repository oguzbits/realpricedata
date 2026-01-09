"use client";

import { type CountryCode } from "@/lib/countries";
import { LocalizedProduct } from "@/lib/server/category-products";
import { IdealoProductCard } from "./IdealoProductCard";

interface IdealoProductGridProps {
  products: LocalizedProduct[];
  countryCode: CountryCode;
}

export function IdealoProductGrid({
  products,
  countryCode,
}: IdealoProductGridProps) {
  return (
    <div
      className="relative grid w-full grid-cols-2 pr-px pb-px sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3"
      style={{
        /* Idealo uses padding instead of negative margins */
        padding: "0 1px 1px 0",
      }}
    >
      {products.map((product) => (
        <IdealoProductCard
          key={product.id || product.slug}
          product={product}
          countryCode={countryCode}
        />
      ))}
    </div>
  );
}
