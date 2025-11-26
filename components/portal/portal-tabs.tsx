'use client';

import { useState, useEffect } from 'react';
import { FiFilm, FiTv, FiBook } from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import { UserMenu } from '@/components/shared/user-menu';
import { AppLogo } from '@/components/shared/app-logo';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mountedTabs, setMountedTabs] = useState<Set<TabType>>(
    new Set([initialTab])
  );

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

  const tabs = [
    { id: 'movies' as TabType, label: 'Movies', icon: FiFilm },
    { id: 'tv-shows' as TabType, label: 'TV Shows', icon: FiTv },
    { id: 'books' as TabType, label: 'Books', icon: FiBook },
    { id: 'games' as TabType, label: 'Games', icon: IoGameController },
  ];

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
      {/* Desktop Header - Top */}
      <header
        className={`hidden md:block sticky top-2 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-24'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <AppLogo href="/portal" size="md" />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <UserMenu />
          </div>
        </nav>
      </header>

      {/* Tab Content */}
      <div className="w-full">{renderTabContent()}</div>

      {/* Mobile Navigation - Bottom */}
      <div
        className={`md:hidden fixed bottom-2 left-2 right-2 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-24'
        }`}
      >
        <nav className="px-3 py-2 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border/50">
          <div className="flex items-center justify-between gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
            {/* User Menu in Mobile Bottom Nav */}
            <div className="flex flex-col items-center gap-1 px-2">
              <UserMenu openUp={true} />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
