'use client';

import { useState } from 'react';
import DiscoverTab from './discover-tab';
import FeedTab from './feed-tab';
import PlaylistTab from './playlist-tab';
import { Tabs } from '@/components/ui/tabs';
import { FiCompass, FiRss, FiList } from 'react-icons/fi';

export default function GamesTab() {
  const [activeTab, setActiveTab] = useState<'discover' | 'feed' | 'playlist'>(
    'discover'
  );
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set(['discover'])
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'discover' | 'feed' | 'playlist');
    setMountedTabs((prev) => new Set(prev).add(tabId));
  };

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: <FiCompass className="w-5 h-5" />,
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: <FiRss className="w-5 h-5" />,
    },
    {
      id: 'playlist',
      label: 'Playlist',
      icon: <FiList className="w-5 h-5" />,
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
        <div style={{ display: activeTab === 'playlist' ? 'block' : 'none' }}>
          {mountedTabs.has('playlist') && <PlaylistTab />}
        </div>
      </div>
    </div>
  );
}
