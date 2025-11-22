'use client';

import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';

interface TVShowDetailsTabsProps {
  similarShows: TVShow[];
}

export function TVShowDetailsTabs({ similarShows }: TVShowDetailsTabsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Similar Shows ({similarShows.length})
      </h2>
      {similarShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {similarShows.slice(0, 12).map((show) => (
            <TVShowCard key={show.id} tvShow={show} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No similar shows found.
        </div>
      )}
    </div>
  );
}
