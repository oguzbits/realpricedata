import { Badge } from "@/components/ui/badge";
import { TrendingDown, Package } from "lucide-react";
import { getCountryByCode } from "@/lib/countries";

export interface ProductCardProps {
  title: string;
  price: number;
  oldPrice?: number;
  currency: string;
  url: string;
  pricePerUnit?: string;
  condition?: string;
  discountPercentage?: number;
  badgeText?: string;
  badgeColor?: "blue" | "green" | "amber";
  countryCode?: string;
}

export function ProductCard({
  title,
  price,
  oldPrice,
  currency,
  url,
  pricePerUnit,
  condition = "New",
  discountPercentage,
  badgeText,
  badgeColor = "blue",
  countryCode = "de",
}: ProductCardProps) {
  const countryConfig = getCountryByCode(countryCode);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(countryConfig?.locale || "de-DE", {
      style: "currency",
      currency: currency || countryConfig?.currency || "EUR",
    }).format(value);
  };

  const getBadgeStyle = () => {
    // Map specific badge text to colors if needed, otherwise use badgeColor
    const color = badgeText === "Best Price" ? "green" : 
                  badgeText === "Good Deal" ? "blue" : 
                  badgeColor;

    switch (color) {
      case "green":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-transparent";
      case "amber":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-transparent";
      case "blue":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-transparent";
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:bg-accent/5 transition-all shadow-sm hover:shadow-xl no-underline h-full"
    >
      <div className="absolute top-3 left-3 z-10">
        {badgeText && (badgeText === "Best Price" || badgeText === "Good Deal") && (
          <Badge
            className={`${getBadgeStyle()} border text-xs font-bold py-1 px-2.5 rounded-lg capitalize shadow-md`}
          >
            {badgeText}
          </Badge>
        )}
      </div>

      {/* Image Placeholder with Icon */}
      <div className="relative aspect-square bg-muted/30 dark:bg-muted/10 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4 transition-all duration-500 group-hover:bg-primary/5">
        <Package className="w-16 h-16 text-muted-foreground/20 stroke-[1.5] group-hover:text-primary/30 transition-colors" />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-foreground mb-2 line-clamp-2 h-9 leading-tight group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Price Section */}
      <div className="mt-auto">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-foreground">
              {formatCurrency(price)}
            </span>
            {oldPrice && (
              <span className="text-[10px] text-muted-foreground/60 line-through">
                {formatCurrency(oldPrice)}
              </span>
            )}
          </div>
          {pricePerUnit && (
            <span className="text-[9px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
              {pricePerUnit}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-linear-to-r from-[#FFD814] to-[#F7CA00] rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
          <button className="relative w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-bold text-xs rounded-xl shadow-sm border border-[#FCD200]/50 transition-all cursor-pointer overflow-hidden active:scale-95">
            <span className="relative z-10">View on Amazon</span>
          </button>
        </div>
      </div>
    </a>
  );
}
