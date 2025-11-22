'use client';

import { useState, useEffect } from 'react';
import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';
import { FiCalendar, FiGrid, FiList, FiTv } from 'react-icons/fi';
import { Dropdown } from '@/components/ui/dropdown';
import { useTVShowCacheStore } from '@/store/tv-show-cache-store';

export default function WatchListTab() {
  const [watchListShows, setWatchListShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const subscribeToStatusChanges = useTVShowCacheStore(
    (state) => state.subscribeToStatusChanges
  );

  const [sortBy, setSortBy] = useState<'added' | 'name' | 'rating'>('added');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleStatusChange = (
    tvShowId: number,
    newStatus:
      | 'want_to_watch'
      | 'watching'
      | 'completed'
      | 'stopped_watching'
      | null
  ) => {
    // Remove TV show from watch list if it's no longer in want_to_watch status
    if (newStatus !== 'want_to_watch') {
      setWatchListShows((prev) => prev.filter((show) => show.id !== tvShowId));
    }
  };

  const fetchWatchList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tv-shows?status=want_to_watch', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setWatchListShows(data.shows || []);
      }
    } catch (err) {
      console.error('Error fetching watch list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchList();

    // Listen for visibility change to refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchWatchList();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Subscribe to status changes for instant updates
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges((tvShowId, status) => {
      handleStatusChange(tvShowId, status);
      // Refetch the list to ensure data consistency
      fetchWatchList();
    });

    return unsubscribe;
  }, [subscribeToStatusChanges]);

  const getSortedShows = () => {
    return [...watchListShows].sort((a, b) => {
      switch (sortBy) {
        case 'added':
          // For now, sort by name since we don't have addedAt in the simplified version
          return a.name.localeCompare(b.name);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        default:
          return 0;
      }
    });
  };

  const sortedShows = getSortedShows();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortOptions = [
    { value: 'added', label: 'Recently Added' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'rating', label: 'Rating' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Watch List</h2>
          <p className="text-muted-foreground mt-1">
            {sortedShows.length} show{sortedShows.length !== 1 ? 's' : ''} to
            watch
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <FiCalendar className="text-muted-foreground" />
            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as typeof sortBy)}
              className="w-44"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TV Shows Display */}
      {sortedShows.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {sortedShows.map((show) => (
              <TVShowCard
                key={show.id}
                tvShow={show}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedShows.map((show) => (
              <div
                key={show.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="w-24 shrink-0">
                  <TVShowCard
                    tvShow={show}
                    onStatusChange={handleStatusChange}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {show.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {show.overview}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {show.first_air_date?.split('-')[0] || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {show.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FiTv className="text-6xl mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Your watch list is empty
          </h3>
          <p className="text-muted-foreground max-w-md">
            Add TV shows you want to watch from the Discover tab to keep track
            of them here!
          </p>
        </div>
      )}
    </div>
  );
}
