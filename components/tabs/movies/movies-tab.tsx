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
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set(['discover'])
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'discover' | 'watchlist');
    setMountedTabs((prev) => new Set(prev).add(tabId));
  };

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
          onTabChange={handleTabChange}
          className="mb-8"
        />

        <div style={{ display: activeTab === 'discover' ? 'block' : 'none' }}>
          {mountedTabs.has('discover') && (
            <DiscoverTab
              popularMovies={popularMovies}
              nowPlayingMovies={nowPlayingMovies}
            />
          )}
        </div>
        <div style={{ display: activeTab === 'watchlist' ? 'block' : 'none' }}>
          {mountedTabs.has('watchlist') && <WatchListTab />}
        </div>
      </div>
    </div>
  );
}
