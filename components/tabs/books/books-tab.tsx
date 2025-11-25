'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { DiscoverTab } from './discover-tab';
import { FeedTab } from './feed-tab';
import { ReadListTab } from './read-list-tab';
import { FiCompass, FiRss, FiBookmark } from 'react-icons/fi';

export default function BooksTab() {
  const [activeTab, setActiveTab] = useState<'discover' | 'feed' | 'read-list'>(
    'discover'
  );
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set(['discover'])
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'discover' | 'feed' | 'read-list');
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
      id: 'read-list',
      label: 'Read List',
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

        <div style={{ display: activeTab === 'discover' ? 'block' : 'none' }}>
          {mountedTabs.has('discover') && <DiscoverTab />}
        </div>
        <div style={{ display: activeTab === 'feed' ? 'block' : 'none' }}>
          {mountedTabs.has('feed') && <FeedTab />}
        </div>
        <div style={{ display: activeTab === 'read-list' ? 'block' : 'none' }}>
          {mountedTabs.has('read-list') && <ReadListTab />}
        </div>
      </div>
    </div>
  );
}
