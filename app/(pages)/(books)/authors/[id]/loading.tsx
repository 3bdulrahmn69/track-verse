export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Skeleton */}
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-linear-to-br from-primary/20 to-secondary/20 animate-pulse">
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="mb-6">
          {/* Back Button Skeleton */}
          <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Author Photo Skeleton */}
          <div className="shrink-0">
            <div className="w-64 aspect-square bg-muted rounded-lg animate-pulse shadow-2xl" />
          </div>

          {/* Details Skeleton */}
          <div className="flex-1 space-y-4">
            {/* Author Name Skeleton */}
            <div className="h-12 bg-muted rounded-lg animate-pulse w-2/3" />

            {/* Birth Date Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-muted rounded animate-pulse" />
              <div className="w-32 h-5 bg-muted rounded animate-pulse" />
            </div>

            {/* Works Count Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-muted rounded animate-pulse" />
              <div className="w-24 h-5 bg-muted rounded animate-pulse" />
            </div>

            {/* Biography Skeleton */}
            <div className="space-y-2">
              <div className="w-24 h-8 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        </div>

        {/* Author's Works Section Skeleton */}
        <section className="mt-12">
          <div className="w-64 h-9 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-3/4 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
