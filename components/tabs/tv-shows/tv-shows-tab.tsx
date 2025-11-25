'use client';

import { useState } from 'react';
import DiscoverTab from './discover-tab';
import CurrentWatchingTab from './current-watching-tab';
import WatchListTab from './watch-list-tab';
import FeedTab from './feed-tab';
import { Tabs } from '@/components/ui/tabs';
import { FiCompass, FiRss, FiEye, FiBookmark } from 'react-icons/fi';

export default function TvShowsTab() {
  const [activeTab, setActiveTab] = useState<
    'feed' | 'discover' | 'watching' | 'watchlist'
  >('discover');
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set(['discover'])
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'feed' | 'discover' | 'watching' | 'watchlist');
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
      id: 'watching',
      label: 'Current Watching',
      icon: <FiEye className="w-5 h-5" />,
    },
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
          {mountedTabs.has('discover') && <DiscoverTab />}
        </div>
        <div style={{ display: activeTab === 'watching' ? 'block' : 'none' }}>
          {mountedTabs.has('watching') && <CurrentWatchingTab />}
        </div>
        <div style={{ display: activeTab === 'watchlist' ? 'block' : 'none' }}>
          {mountedTabs.has('watchlist') && <WatchListTab />}
        </div>
      </div>
    </div>
  );
}
