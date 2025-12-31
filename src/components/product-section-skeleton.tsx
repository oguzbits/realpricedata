import { Skeleton } from "@/components/ui/skeleton";

export function ProductSectionSkeleton() {
  return (
    <div className="mb-16">
      <div className="mb-8">
        <Skeleton className="mb-2 h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[293px] shrink-0 space-y-4 rounded-2xl border p-4">
            <Skeleton className="aspect-4/3 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-auto space-y-3 pt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
