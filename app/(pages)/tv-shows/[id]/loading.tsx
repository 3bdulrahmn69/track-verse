export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Skeleton */}
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-muted animate-pulse">
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="mb-6">
          {/* Back Button Skeleton */}
          <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Skeleton */}
          <div className="shrink-0">
            <div className="w-64 aspect-2/3 bg-muted rounded-lg animate-pulse shadow-2xl" />
          </div>

          {/* Details Skeleton */}
          <div className="flex-1 space-y-4">
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded-lg animate-pulse w-3/4" />
              <div className="h-6 bg-muted rounded-lg animate-pulse w-1/2" />
            </div>

            {/* Meta Information Skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="w-16 h-5 bg-muted rounded animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="w-12 h-5 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="w-32 h-5 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Genres Skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="w-20 h-8 bg-muted rounded-full animate-pulse" />
              <div className="w-16 h-8 bg-muted rounded-full animate-pulse" />
              <div className="w-24 h-8 bg-muted rounded-full animate-pulse" />
              <div className="w-18 h-8 bg-muted rounded-full animate-pulse" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="w-32 h-12 bg-muted rounded-lg animate-pulse" />
              <div className="w-24 h-12 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Creators and Trailer Skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-24 h-5 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-32 h-10 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Overview Skeleton */}
            <div className="space-y-2">
              <div className="w-24 h-8 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              </div>
            </div>

            {/* Networks Skeleton */}
            <div className="space-y-3">
              <div className="w-20 h-7 bg-muted rounded animate-pulse" />
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card">
                  <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                  <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card">
                  <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                  <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Additional Info Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                <div className="w-16 h-5 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="w-10 h-4 bg-muted rounded animate-pulse" />
                <div className="w-20 h-5 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="w-28 h-4 bg-muted rounded animate-pulse" />
                <div className="w-18 h-5 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-24 h-5 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section Skeleton */}
        <section className="mt-12">
          <div className="w-32 h-8 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-16 h-3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Episodes Section Skeleton */}
        <section className="mt-12">
          <div className="w-24 h-8 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {/* Season Header */}
            <div className="flex items-center justify-between p-4 bg-card rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="w-32 h-5 bg-muted rounded animate-pulse" />
                  <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg"
                >
                  <div className="w-16 h-10 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="w-48 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-32 h-3 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-6 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Similar Shows Tabs Skeleton */}
        <section className="mt-12">
          <div className="flex gap-2 mb-6">
            <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-10 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-2/3 bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
