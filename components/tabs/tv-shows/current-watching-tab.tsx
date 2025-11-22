'use client';

import { useState, useEffect } from 'react';
import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';
import { FiFilter, FiTv } from 'react-icons/fi';
import { Dropdown } from '@/components/ui/dropdown';
import { useTVShowCacheStore } from '@/store/tv-show-cache-store';

export default function CurrentWatchingTab() {
  const [currentWatchingShows, setCurrentWatchingShows] = useState<TVShow[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const subscribeToStatusChanges = useTVShowCacheStore(
    (state) => state.subscribeToStatusChanges
  );

  const [filter, setFilter] = useState<
    'all' | 'watching' | 'completed' | 'stopped_watching'
  >('all');

  const handleStatusChange = (
    tvShowId: number,
    newStatus:
      | 'want_to_watch'
      | 'watching'
      | 'completed'
      | 'stopped_watching'
      | null
  ) => {
    // Remove TV show from current watching if it's no longer in watching/completed/stopped_watching status
    if (
      newStatus !== 'watching' &&
      newStatus !== 'completed' &&
      newStatus !== 'stopped_watching'
    ) {
      setCurrentWatchingShows((prev) =>
        prev.filter((show) => show.id !== tvShowId)
      );
    }
  };

  const fetchCurrentWatching = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/tv-shows?status=watching,completed,stopped_watching',
        {
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentWatchingShows(data.shows || []);
      }
    } catch (err) {
      console.error('Error fetching current watching:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWatching();

    // Listen for visibility change to refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCurrentWatching();
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
      fetchCurrentWatching();
    });

    return unsubscribe;
  }, [subscribeToStatusChanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'stopped_watching', label: 'Stopped Watching' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Current Watching
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentWatchingShows.length} show
            {currentWatchingShows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-muted-foreground" />
          <Dropdown
            options={filterOptions}
            value={filter}
            onChange={(value) => setFilter(value as typeof filter)}
            className="w-40"
          />
        </div>
      </div>

      {/* TV Shows Grid */}
      {currentWatchingShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {currentWatchingShows.map((show) => (
            <div key={show.id} className="relative">
              <TVShowCard tvShow={show} onStatusChange={handleStatusChange} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FiTv className="text-6xl mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {filter === 'all' ? 'No TV shows yet' : `No ${filter} shows`}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {filter === 'all'
              ? 'Start tracking your TV shows by adding them from the Discover tab!'
              : `You don't have any ${filter} shows yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
