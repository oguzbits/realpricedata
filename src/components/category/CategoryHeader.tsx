import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/categories";

import { getCategoryIcon } from "@/lib/category-icons";

import { Breadcrumbs } from "@/components/breadcrumbs";

interface CategoryHeaderProps {
  category: Omit<Category, "icon">;
  countryCode: string;
  breadcrumbs: (Omit<Category, "icon"> & {
    Icon: React.ComponentType<{ className?: string }>;
  })[];
  productCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterTrigger?: React.ReactNode;
}

export function CategoryHeader({
  category,
  countryCode,
  breadcrumbs,
  productCount,
  searchValue,
  onSearchChange,
  filterTrigger,
}: CategoryHeaderProps) {
  const Icon = getCategoryIcon(category.slug);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Categories", href: `/${countryCode}/categories` },
    ...breadcrumbs.map((crumb) => ({
      name: crumb.name,
      href: `/${countryCode}/${crumb.parent ? crumb.parent + "/" : ""}${crumb.slug}`,
    })),
  ];

  const searchInput = (
    <div className="relative flex-1 md:w-72 lg:w-96 md:flex-none">
      <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
      <Input
        placeholder="Search products..."
        className="bg-card dark:bg-card focus-visible:border-primary h-10 pl-8 shadow-sm transition-colors focus-visible:ring-0"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search products"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: Breadcrumbs + Desktop/Tablet Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Breadcrumbs items={breadcrumbItems} className="mb-0" />

        <div className="hidden md:flex items-center gap-2">
          {searchInput}
          <div className="lg:hidden">
            {filterTrigger}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Controls (Below MD) */}
      <div className="flex items-center gap-2 md:hidden">
        {searchInput}
        {filterTrigger}
      </div>
    </div>
  );
}
