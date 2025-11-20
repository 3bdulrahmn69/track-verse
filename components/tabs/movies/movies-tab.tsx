'use client';

import { useState } from 'react';
import DiscoverTab from './discover-tab';
import WatchListTab from './watch-list-tab';
import { Tabs } from '@/components/ui/tabs';
import type { Movie } from '@/lib/tmdb';

interface MoviesTabProps {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
}

export default function MoviesTab({
  popularMovies,
  nowPlayingMovies,
}: MoviesTabProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'watchlist'>(
    'discover'
  );

  const tabs = [
    { id: 'discover', label: 'Discover' },
    { id: 'watchlist', label: 'Watch List' },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) =>
            setActiveTab(tabId as 'discover' | 'watchlist')
          }
          className="mb-8"
        />

        {activeTab === 'discover' && (
          <DiscoverTab
            popularMovies={popularMovies}
            nowPlayingMovies={nowPlayingMovies}
          />
        )}
        {activeTab === 'watchlist' && <WatchListTab />}
      </div>
    </div>
  );
}
