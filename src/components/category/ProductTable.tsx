import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, getAffiliateRedirectPath } from "@/lib/product-registry";

interface ProductTableProps {
  products: Product[];
  unitLabel: string;
  categorySlug: string;
  sortBy: string;
  sortOrder: string;
  onSort: (key: string) => void;
  formatCurrency: (value: number, fractionDigits?: number) => string;
  onAffiliateClick: (product: Product, index: number) => void;
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
    const effectiveSortBy = !sortBy ? 'pricePerUnit' : sortBy;
    if (effectiveSortBy !== key) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortOrder === 'asc'
      ? <ChevronUp className="ml-1 h-3 w-3" />
      : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(key);
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset w-[140px]" 
              onClick={() => onSort('pricePerUnit')}
              onKeyDown={(e) => handleKeyDown(e, 'pricePerUnit')}
              tabIndex={0}
              aria-sort={sortBy === 'pricePerUnit' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              role="columnheader"
            >
              <div className="flex items-center">Price/{unitLabel} {getSortIcon('pricePerUnit')}</div>
            </TableHead>
            <TableHead className="min-w-[200px]">Product</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset" 
              onClick={() => onSort('price')}
              onKeyDown={(e) => handleKeyDown(e, 'price')}
              tabIndex={0}
              aria-sort={sortBy === 'price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              role="columnheader"
            >
              <div className="flex items-center">Price {getSortIcon('price')}</div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset" 
              onClick={() => onSort('capacity')}
              onKeyDown={(e) => handleKeyDown(e, 'capacity')}
              tabIndex={0}
              aria-sort={sortBy === 'capacity' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              role="columnheader"
            >
              <div className="flex items-center">Capacity {getSortIcon('capacity')}</div>
            </TableHead>
            <TableHead className="hidden md:table-cell">Warranty</TableHead>
            <TableHead className="hidden sm:table-cell">Form Factor</TableHead>
            <TableHead className="hidden sm:table-cell">
              {categorySlug === 'power-supplies' ? 'Certification' : 'Technology'}
            </TableHead>
            <TableHead className="hidden sm:table-cell">Condition</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id || product.slug} className="group hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-bold text-foreground">
                {formatCurrency(product.pricePerUnit || 0, 3)}
              </TableCell>
              <TableCell>
                <a 
                  href={getAffiliateRedirectPath(product.slug)}
                  onClick={() => onAffiliateClick(product, index)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline text-base line-clamp-2 block leading-snug"
                >
                  {product.title}
                </a>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {product.capacity} {product.capacityUnit}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {product.warranty}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {product.formFactor}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {categorySlug === 'power-supplies' 
                  ? (product.certification || product.technology) 
                  : product.technology}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold px-2 py-0 border-0 shadow-none",
                    product.condition === 'New' && "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
                    product.condition === 'Renewed' && "bg-blue-100/50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
                    product.condition === 'Used' && "bg-amber-100/50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                  )}
                >
                  {product.condition}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <a 
                  href={getAffiliateRedirectPath(product.slug)}
                  onClick={() => onAffiliateClick(product, index)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <button className="h-9 px-4 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-bold text-sm rounded-xl shadow-sm border border-[#FCD200]/50 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]">
                    View Deal
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
