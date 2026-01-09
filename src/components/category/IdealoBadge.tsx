/**
 * Idealo Badge Component
 *
 * Skewed badge for labels like "Bestseller" or discount percentages.
 *
 * Classes from Idealo:
 * - sr-badge_Y3nWk
 * - sr-badge__label_UovZn
 * - sr-bargainBadge_inDJP (for discount badges)
 */

import { cn } from "@/lib/utils";

interface IdealoBadgeProps {
  /** Badge label text */
  label: string;
  /** Badge variant */
  variant?: "default" | "discount";
  /** Additional className */
  className?: string;
}

export function IdealoBadge({
  label,
  variant = "default",
  className,
}: IdealoBadgeProps) {
  if (variant === "discount") {
    return (
      <div
        className={cn(
          "sr-bargainBadge",
          "relative inline-flex h-6 items-center",
          className,
        )}
      >
        <span
          className={cn(
            "sr-bargainBadge__savingBadge",
            "relative z-10 rounded-sm bg-[#38bf84] px-2 py-0.5",
            "text-[12px] leading-[14px] font-medium text-white",
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sr-badge",
        "relative inline-flex h-6 items-center",
        className,
      )}
    >
      <span
        className={cn(
          "sr-badge__label",
          "relative z-10 flex items-center px-1",
          "text-[12px] leading-[14px] font-medium text-white",
        )}
      >
        {label}
      </span>
      {/* Background with skew effect */}
      <span
        className="absolute inset-0 z-0 rounded-sm bg-[#076dcd]"
        style={{
          transform: "skew(-10deg, 0deg)",
          transformOrigin: "bottom left",
        }}
      />
    </div>
  );
}
