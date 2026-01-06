"use client";

import { ProductSection } from "@/components/ProductSection";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { parseAsString, useQueryStates } from "nuqs";

interface PriceDropsProps {
  products: (Product & { dropPercentage: number })[];
  country: string;
}

export function PriceDrops({ products, country }: PriceDropsProps) {
  const [{ period, category }, setFilters] = useQueryStates({
    period: parseAsString.withDefault("daily"),
    category: parseAsString.withDefault("all"),
  });

  const setPeriod = (p: "daily" | "weekly") => setFilters({ period: p });
  const setCategory = (c: string) => setFilters({ category: c });

  const filteredProducts = products
    .map((p) => ({
      ...p,
      discountPercentage: p.dropPercentage,
    }))
    .sort((a, b) =>
      period === "daily"
        ? b.discountPercentage - a.discountPercentage
        : a.discountPercentage - b.discountPercentage,
    );

  const categories = [
    { label: "All Products", value: "all" },
    { label: "Hard Drives", value: "hard-drives" },
    { label: "RAM", value: "ram" },
    { label: "Power Supplies", value: "power-supplies" },
  ];

  return (
    <ProductSection
      title="Top Amazon Price Drops"
      description="The products below have seen significant price drops since the last update. Save big by choosing these vetted deals."
      products={filteredProducts}
      country={country}
      categories={categories}
      selectedCategory={category}
      onCategoryChange={setCategory}
    >
      <div className="-mt-2 mb-6 flex gap-2">
        <button
          onClick={() => setPeriod("daily")}
          className={cn(
            "cursor-pointer rounded-xl border px-4 py-1.5 text-sm font-bold transition-all duration-300",
            period === "daily"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:bg-secondary/70",
          )}
        >
          Daily Drops
        </button>
        <button
          onClick={() => setPeriod("weekly")}
          className={cn(
            "cursor-pointer rounded-xl border px-4 py-1.5 text-sm font-bold transition-all duration-300",
            period === "weekly"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:bg-secondary/70",
          )}
        >
          Weekly Drops
        </button>
      </div>
    </ProductSection>
  );
}
