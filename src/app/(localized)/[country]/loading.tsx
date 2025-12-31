import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-background flex flex-col gap-0 pb-8 md:pb-16">
      <div className="flex flex-col gap-2 pt-4 sm:gap-4 md:gap-8">
        <section className="container mx-auto px-4 pt-4 sm:pt-8 md:pt-12">
          {/* Hero Section Skeleton */}
          <div className="mb-16 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="order-1 max-w-2xl text-left lg:order-1">
              <Skeleton className="mb-6 h-16 w-3/4 sm:h-20" />
              <Skeleton className="mb-8 h-24 w-full max-w-xl" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>
            <div className="relative order-2 mx-auto hidden w-full max-w-[800px] lg:order-2 lg:ml-auto lg:block">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>

          {/* Marketplaces Skeleton */}
          <div className="border-border mb-16 flex flex-col items-center justify-center border-y py-10">
            <Skeleton className="mb-6 h-4 w-48" />
            <div className="flex flex-wrap justify-center gap-10">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Content Skeletons */}
          <div className="space-y-16">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-4 h-8 w-64" />
                <div className="flex gap-6 overflow-hidden">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-80 w-[293px] shrink-0 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
