"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Lädt...",
  className,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#0066cc]",
          sizeClasses[size],
        )}
      />
      {message && <p className="text-sm text-[#666]">{message}</p>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-[#e5e5e5]", className)}
      aria-hidden="true"
    />
  );
}

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-[200px] shrink-0 flex-col rounded bg-white p-3",
        className,
      )}
    >
      <LoadingSkeleton className="mb-3 h-[140px] w-full" />
      <LoadingSkeleton className="mb-2 h-4 w-3/4" />
      <LoadingSkeleton className="mb-2 h-4 w-1/2" />
      <LoadingSkeleton className="h-5 w-1/3" />
    </div>
  );
}
