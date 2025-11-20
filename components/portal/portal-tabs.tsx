'use client';

import { useState, useEffect } from 'react';
import { FiFilm, FiTv, FiBook, FiMonitor } from 'react-icons/fi';
import { UserMenu } from '@/components/shared/user-menu';
import Link from 'next/link';

interface PortalTabsProps {
  moviesTab: React.ReactNode;
  tvShowsTab: React.ReactNode;
  booksTab: React.ReactNode;
  gamesTab: React.ReactNode;
}

type TabType = 'movies' | 'tv-shows' | 'books' | 'games';

export function PortalTabs({
  moviesTab,
  tvShowsTab,
  booksTab,
  gamesTab,
}: PortalTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    { id: 'games' as TabType, label: 'Games', icon: FiMonitor },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'movies':
        return moviesTab;
      case 'tv-shows':
        return tvShowsTab;
      case 'books':
        return booksTab;
      case 'games':
        return gamesTab;
      default:
        return moviesTab;
    }
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
            <Link
              href="/portal"
              className="text-xl font-bold text-primary hover:text-primary/90 transition-colors"
            >
              Track Verse
            </Link>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
                  onClick={() => setActiveTab(tab.id)}
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
