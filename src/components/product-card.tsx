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
    // Map specific badge text to colors if needed
    if (badgeText === "Best Price") {
      // CCC: Dark Green text (#1f5200) on Light Green bg (#95ff54)
      return "bg-[#95ff54] text-[#1f5200] border-[#1f5200]/20 shadow-sm";
    }
    if (badgeText === "Good Deal") {
      // CCC: Light Green text (#95ff54) on Dark Green bg (#1f5200)
      return "bg-[#1f5200] text-[#95ff54] border-[#95ff54]/20 shadow-inner";
    }

    switch (badgeColor) {
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
      className="group relative flex flex-col p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:bg-accent/5 transition-all shadow-sm hover:shadow-xl no-underline w-[280px] sm:w-[300px] shrink-0 h-full"
    >
      <div className="absolute top-3 left-3 z-10">
        {badgeText && (badgeText === "Best Price" || badgeText === "Good Deal") && (
          <Badge
            className={`${getBadgeStyle()} border text-xs font-black py-1 px-2.5 rounded-lg capitalize shadow-md tracking-tight`}
          >
            {badgeText}
          </Badge>
        )}
      </div>

      {/* Image Placeholder with Icon */}
      <div className="relative aspect-square bg-muted/20 dark:bg-muted/10 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-5 transition-all duration-500 group-hover:bg-primary/5">
        <Package className="w-16 h-16 text-muted-foreground/10 stroke-1 group-hover:text-primary/20 transition-colors" />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title - Improved Readability based on CCC */}
      <div className="h-[3.2rem] mb-4 overflow-hidden">
        <h3 className="text-base font-bold text-foreground leading-[1.6] group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
      </div>

      {/* Price Section */}
      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-foreground leading-none">
              {formatCurrency(price)}
            </span>
            {oldPrice && (
              <span className="text-xs text-muted-foreground/50 line-through mt-0.5 font-medium">
                Was: {formatCurrency(oldPrice)}
              </span>
            )}
          </div>
          {pricePerUnit && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-widest mb-0.5">Unit Price</span>
              <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                {pricePerUnit}
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="relative pt-0.5">
          <div className="absolute -inset-0.5 bg-linear-to-r from-[#FFD814] to-[#F7CA00] rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
          <button className="relative w-full py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-black text-sm rounded-xl shadow-sm border border-[#FCD200]/50 transition-all cursor-pointer overflow-hidden active:scale-[0.98]">
            <span className="relative z-10">View on Amazon</span>
          </button>
        </div>
      </div>
    </a>
  );
}
