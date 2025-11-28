'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalHeader } from './portal-header';

interface PortalTabsProps {
  moviesTab: React.ReactNode;
  tvShowsTab: React.ReactNode;
  booksTab: React.ReactNode;
  gamesTab: React.ReactNode;
  initialTab?: 'movies' | 'tv-shows' | 'books' | 'games';
}

type TabType = 'movies' | 'tv-shows' | 'books' | 'games';

export function PortalTabs({
  moviesTab,
  tvShowsTab,
  booksTab,
  gamesTab,
  initialTab = 'movies',
}: PortalTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL or use initialTab
  const urlTab = searchParams.get('tab') as TabType;
  const validTabs: TabType[] = ['movies', 'tv-shows', 'books', 'games'];
  const currentTab = urlTab && validTabs.includes(urlTab) ? urlTab : initialTab;

  const [activeTab, setActiveTab] = useState<TabType>(currentTab);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mountedTabs, setMountedTabs] = useState<Set<TabType>>(
    new Set([currentTab])
  );
  const prevTabRef = useRef(currentTab);

  // Sync with URL changes (browser back/forward)
  useEffect(() => {
    if (currentTab !== prevTabRef.current) {
      prevTabRef.current = currentTab;
      startTransition(() => {
        setActiveTab(currentTab);
        setMountedTabs((prev) => new Set(prev).add(currentTab));
      });
    }
  }, [currentTab]);

  // Cache tabs that have been mounted
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setMountedTabs((prev) => new Set(prev).add(tabId));

    // Update URL with query parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/portal?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const renderTabContent = () => {
    return (
      <>
        <div style={{ display: activeTab === 'movies' ? 'block' : 'none' }}>
          {mountedTabs.has('movies') && moviesTab}
        </div>
        <div style={{ display: activeTab === 'tv-shows' ? 'block' : 'none' }}>
          {mountedTabs.has('tv-shows') && tvShowsTab}
        </div>
        <div style={{ display: activeTab === 'books' ? 'block' : 'none' }}>
          {mountedTabs.has('books') && booksTab}
        </div>
        <div style={{ display: activeTab === 'games' ? 'block' : 'none' }}>
          {mountedTabs.has('games') && gamesTab}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <PortalHeader
        activeTab={activeTab}
        isVisible={isVisible}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className="w-full">{renderTabContent()}</div>
    </div>
  );
}
