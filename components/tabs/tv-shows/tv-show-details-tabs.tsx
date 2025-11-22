'use client';

import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';
import { FiTv } from 'react-icons/fi';

interface TVShowDetailsTabsProps {
  similarShows: TVShow[];
}

export function TVShowDetailsTabs({ similarShows }: TVShowDetailsTabsProps) {
  return (
    <div>
      {similarShows.length > 0 && (
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Similar Shows
        </h2>
      )}
      {similarShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {similarShows.slice(0, 12).map((show) => (
            <TVShowCard key={show.id} tvShow={show} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <FiTv className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                No Similar Shows Found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn&apos;t find any shows similar to this one. Try
                exploring other shows in our collection!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
