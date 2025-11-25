'use client';

import { useState } from 'react';
import DiscoverTab from './discover-tab';
import WatchListTab from './watch-list-tab';
import FeedTab from './feed-tab';
import { Tabs } from '@/components/ui/tabs';
import type { Movie } from '@/lib/tmdb';
import { FiCompass, FiRss, FiBookmark } from 'react-icons/fi';

interface MoviesTabProps {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
}

export default function MoviesTab({
  popularMovies,
  nowPlayingMovies,
}: MoviesTabProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'watchlist'>(
    'discover'
  );
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set(['discover'])
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'feed' | 'discover' | 'watchlist');
    setMountedTabs((prev) => new Set(prev).add(tabId));
  };

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: <FiCompass className="w-5 h-5" />,
    },
    { id: 'feed', label: 'Feed', icon: <FiRss className="w-5 h-5" /> },
    {
      id: 'watchlist',
      label: 'Watch List',
      icon: <FiBookmark className="w-5 h-5" />,
    },
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

        <div style={{ display: activeTab === 'feed' ? 'block' : 'none' }}>
          {mountedTabs.has('feed') && <FeedTab />}
        </div>
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
