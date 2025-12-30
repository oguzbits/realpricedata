import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ChevronsUpDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Product, getAffiliateRedirectPath } from "@/lib/product-registry";
import { LocalizedProduct } from "@/hooks/use-category-products";

interface ProductTableProps {
  products: LocalizedProduct[];
  unitLabel: string;
  categorySlug: string;
  sortBy: string;
  sortOrder: string;
  onSort: (key: string) => void;
  formatCurrency: (value: number, fractionDigits?: number) => string;
  onAffiliateClick: (product: LocalizedProduct, index: number) => void;
}

export function ProductTable({
  products,
  unitLabel,
  categorySlug,
  sortBy,
  sortOrder,
  onSort,
  formatCurrency,
  onAffiliateClick,
}: ProductTableProps) {
  const getSortIcon = (key: string) => {
    const effectiveSortBy = !sortBy ? "pricePerUnit" : sortBy;
    if (effectiveSortBy !== key)
      return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSort(key);
    }
  };

  return (
    <div className="bg-card rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-primary w-[100px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset sm:w-[140px]"
              onClick={() => onSort("pricePerUnit")}
              onKeyDown={(e) => handleKeyDown(e, "pricePerUnit")}
              tabIndex={0}
              aria-sort={
                sortBy === "pricePerUnit"
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              role="columnheader"
            >
              <div className="flex items-center gap-1.5">
                <span>Price/{unitLabel}</span>
                {getSortIcon("pricePerUnit")}
              </div>
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-primary hidden cursor-pointer pr-4 outline-none focus-visible:ring-2 focus-visible:ring-inset sm:table-cell sm:pr-12"
              onClick={() => onSort("price")}
              onKeyDown={(e) => handleKeyDown(e, "price")}
              tabIndex={0}
              aria-sort={
                sortBy === "price"
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              role="columnheader"
            >
              <div className="flex items-center">
                Price {getSortIcon("price")}
              </div>
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-primary hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset sm:table-cell"
              onClick={() => onSort("capacity")}
              onKeyDown={(e) => handleKeyDown(e, "capacity")}
              tabIndex={0}
              aria-sort={
                sortBy === "capacity"
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              role="columnheader"
            >
              <div className="flex items-center">
                Capacity {getSortIcon("capacity")}
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] sm:min-w-[200px]">Product</TableHead>
            <TableHead className="hidden md:table-cell">Warranty</TableHead>
            <TableHead className="hidden sm:table-cell">Form Factor</TableHead>
            <TableHead className="hidden sm:table-cell">
              {categorySlug === "power-supplies"
                ? "Certification"
                : "Technology"}
            </TableHead>
            <TableHead className="hidden sm:table-cell">Condition</TableHead>
            <TableHead className="px-2 text-right sm:px-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow
              key={product.id || product.slug}
              className="group hover:bg-muted/30 transition-colors"
            >
              <TableCell className="text-foreground font-mono text-[13px] font-bold sm:text-base">
                {formatCurrency(product.pricePerUnit || 0, 2)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden whitespace-nowrap pr-4 font-mono sm:table-cell sm:pr-12">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden font-mono sm:table-cell">
                {product.capacity} {product.capacityUnit}
              </TableCell>
              <TableCell className="max-w-0 sm:max-w-none">
                <div className="flex flex-col">
                  <a
                    href={getAffiliateRedirectPath(product.slug)}
                    onClick={() => onAffiliateClick(product, index)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary line-clamp-2 block text-sm leading-snug font-medium hover:underline sm:text-base"
                  >
                    {product.title}
                  </a>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5 font-mono text-[10px] sm:hidden">
                    <span>{formatCurrency(product.price)}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>
                      {product.capacity} {product.capacityUnit}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                {product.warranty}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                {product.formFactor}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                {categorySlug === "power-supplies"
                  ? product.certification || product.technology
                  : product.technology}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 px-2 py-0 text-xs font-semibold shadow-none",
                    product.condition === "New" &&
                      "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
                    product.condition === "Renewed" &&
                      "bg-secondary text-secondary-foreground",
                    product.condition === "Used" &&
                      "bg-amber-100/50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
                  )}
                >
                  {product.condition}
                </Badge>
              </TableCell>
              <TableCell className="px-2 text-right sm:px-4">
                <a
                  href={getAffiliateRedirectPath(product.slug)}
                  onClick={() => onAffiliateClick(product, index)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <button className="h-8 cursor-pointer rounded-lg border border-[#FCD200]/50 bg-[#FFD814] px-3 text-[11px] font-bold whitespace-nowrap text-black shadow-sm transition-all hover:bg-[#F7CA00] active:scale-[0.98] sm:h-9 sm:rounded-xl sm:px-4 sm:text-sm">
                    <span className="sm:hidden">View</span>
                    <span className="hidden sm:inline">View on Amazon</span>
                  </button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
