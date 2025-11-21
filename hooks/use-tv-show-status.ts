import { useState, useEffect, useCallback } from 'react';
import type { TVShow } from '@/lib/tmdb';
import {
  useTVShowCacheStore,
  type TVShowStatus,
} from '@/store/tv-show-cache-store';

export type { TVShowStatus };

export function useTVShowStatus(
  tvShowId: number,
  onStatusChange?: (
    newStatus: TVShowStatus,
    watchedEpisodes?: number,
    totalEpisodes?: number
  ) => void
) {
  const [status, setStatus] = useState<TVShowStatus>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<number | undefined>();
  const [totalEpisodes, setTotalEpisodes] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const { getTVShowStatus, updateTVShowStatusCache } = useTVShowCacheStore();

  const fetchStatus = useCallback(async () => {
    try {
      const cachedData = await getTVShowStatus(tvShowId);
      setStatus(cachedData.status);
      setWatchedEpisodes(cachedData.watchedEpisodes);
      setTotalEpisodes(cachedData.totalEpisodes);
    } catch (error) {
      console.error('Error fetching TV show status:', error);
    } finally {
      setLoading(false);
    }
  }, [tvShowId, getTVShowStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Subscribe to status changes for this specific TV show
  useEffect(() => {
    const { subscribeToStatusChanges } = useTVShowCacheStore.getState();
    const unsubscribe = subscribeToStatusChanges(
      (changedTVShowId, newStatus, watchedEps, totalEps) => {
        if (changedTVShowId === tvShowId) {
          // Status changed for this TV show, update local state
          setStatus(newStatus);
          setWatchedEpisodes(watchedEps);
          setTotalEpisodes(totalEps);
          onStatusChange?.(newStatus, watchedEps, totalEps);
        }
      }
    );

    return unsubscribe;
  }, [tvShowId, onStatusChange]);

  const updateStatus = async (
    newStatus: TVShowStatus,
    tvShow: TVShow,
    watchedEpisodesCount?: number,
    totalEpisodesCount?: number
  ) => {
    try {
      if (newStatus === null) {
        // Remove from list
        const response = await fetch(`/api/tv-shows/${tvShowId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to remove TV show');
        }
      } else {
        // Add or update status
        const response = await fetch('/api/tv-shows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tvShowId: tvShow.id,
            tvShowName: tvShow.name,
            tvShowPosterPath: tvShow.poster_path,
            tvShowFirstAirDate: tvShow.first_air_date,
            status: newStatus,
            watchedEpisodes: watchedEpisodesCount,
            totalEpisodes: totalEpisodesCount,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update TV show status');
        }
      }

      setStatus(newStatus);
      setWatchedEpisodes(watchedEpisodesCount);
      setTotalEpisodes(totalEpisodesCount);
      updateTVShowStatusCache(
        tvShowId,
        newStatus,
        watchedEpisodesCount,
        totalEpisodesCount
      );
      onStatusChange?.(newStatus, watchedEpisodesCount, totalEpisodesCount);
    } catch (error) {
      console.error('Error updating TV show status:', error);
    }
  };

  return {
    status,
    watchedEpisodes,
    totalEpisodes,
    loading,
    updateStatus,
  };
}
