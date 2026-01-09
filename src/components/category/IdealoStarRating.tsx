/**
 * Idealo Star Rating Component
 *
 * Displays star rating with percentage fill, matching Idealo's format:
 * "Note ∅ X,X" + star icons + review count
 *
 * Classes from Idealo:
 * - sr-productRating_cszy2
 * - sr-productRating__avg_f16ZD
 * - sr-starRating__wrapper_KbWD3
 * - sr-starRating__stars_kEJLE sr-starRating__stars--{percentage}
 * - sr-starRating__count_laI5k
 */

import { cn } from "@/lib/utils";

interface IdealoStarRatingProps {
  /** Rating value (e.g., 1.5, 1.9, 2.2) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Additional className */
  className?: string;
}

export function IdealoStarRating({
  rating,
  reviewCount,
  className,
}: IdealoStarRatingProps) {
  // Calculate percentage for star fill (5 stars = 100%)
  const percentage = rating ? Math.min(100, Math.round((rating / 5) * 100)) : 0;

  // Format rating as German decimal (e.g., 1,5)
  const formattedRating = rating
    ? rating.toLocaleString("de-DE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : null;

  return (
    <div className={cn("sr-productRating flex items-center gap-1", className)}>
      {/* Note average */}
      {formattedRating && (
        <span className="sr-productRating__avg text-[12px] leading-[14px] text-[#767676]">
          Note ∅ {formattedRating}
        </span>
      )}

      {/* Star rating wrapper */}
      <div className="sr-starRating__wrapper flex items-center gap-0.5">
        {/* Stars container with fill percentage */}
        <div
          className="sr-starRating__stars relative flex items-center"
          style={{ gap: "1px" }}
        >
          {/* Background (empty) stars */}
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={`empty-${i}`}
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="#dcdcdc"
              className="h-3 w-3"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}

          {/* Foreground (filled) stars with clip */}
          <div
            className="absolute inset-0 flex items-center overflow-hidden"
            style={{
              width: `${percentage}%`,
              gap: "1px",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={`filled-${i}`}
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#f97316"
                className="h-3 w-3 shrink-0"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Review count */}
        {reviewCount !== undefined && reviewCount > 0 && (
          <span className="sr-starRating__count text-[12px] leading-[14px] text-[#767676]">
            {reviewCount}
          </span>
        )}
      </div>
    </div>
  );
}
