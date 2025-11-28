'use client';

import { useState } from 'react';
import { FiFilm, FiTv, FiBook, FiSearch } from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import { UserMenu } from '@/components/shared/user-menu';
import { AppLogo } from '@/components/shared/app-logo';
import { UserSearchModal } from '@/components/portal/user-search-modal';

type TabType = 'movies' | 'tv-shows' | 'books' | 'games';

interface PortalHeaderProps {
  activeTab: TabType;
  isVisible: boolean;
  onTabChange: (tabId: TabType) => void;
}

const tabs = [
  { id: 'movies' as TabType, label: 'Movies', icon: FiFilm },
  { id: 'tv-shows' as TabType, label: 'TV Shows', icon: FiTv },
  { id: 'books' as TabType, label: 'Books', icon: FiBook },
  { id: 'games' as TabType, label: 'Games', icon: IoGameController },
];

export function PortalHeader({
  activeTab,
  isVisible,
  onTabChange,
}: PortalHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
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
                    onClick={() => onTabChange(tab.id)}
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

            {/* Search & User Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full text-foreground hover:bg-muted transition-colors"
                aria-label="Search users"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>

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
                  onClick={() => onTabChange(tab.id)}
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
            {/* Search Button in Mobile */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-full font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            {/* User Menu in Mobile Bottom Nav */}
            <div className="flex flex-col items-center gap-1 px-2">
              <UserMenu openUp={true} />
            </div>
          </div>
        </nav>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
