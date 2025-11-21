'use client';

import { useState } from 'react';
import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';
import { Tabs } from '@/components/ui/tabs';

interface TVShowDetailsTabsProps {
  tvShowName: string;
  similarShows: TVShow[];
}

export function TVShowDetailsTabs({
  tvShowName,
  similarShows,
}: TVShowDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<'similar' | 'reviews'>('similar');

  const tabs = [
    { id: 'similar', label: `Similar Shows (${similarShows.length})` },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'similar' | 'reviews')}
        className="mb-8"
      />

      {activeTab === 'similar' && (
        <div>
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
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Reviews feature coming soon!</p>
            <p className="text-sm">
              Share your thoughts and read what others think about {tvShowName}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
