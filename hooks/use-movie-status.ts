import { useState, useEffect, useCallback } from 'react';
import type { Movie } from '@/lib/tmdb';
import {
  useMovieCacheStore,
  type MovieStatus,
} from '@/store/movie-cache-store';

export type { MovieStatus };

export function useMovieStatus(
  movieId: number,
  onStatusChange?: (newStatus: MovieStatus) => void
) {
  const [status, setStatus] = useState<MovieStatus>(null);
  const [loading, setLoading] = useState(true);
  const { getMovieStatus, updateMovieStatusCache } = useMovieCacheStore();

  const fetchStatus = useCallback(async () => {
    try {
      const cachedStatus = await getMovieStatus(movieId);
      setStatus(cachedStatus);
    } catch (error) {
      console.error('Error fetching movie status:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId, getMovieStatus]);

  const updateStatus = async (
    newStatus: MovieStatus,
    movie: Movie,
    rating?: number,
    comment?: string
  ) => {
    try {
      if (newStatus === null) {
        // Remove from list
        await fetch(`/api/movies?movieId=${movieId}`, {
          method: 'DELETE',
        });
      } else {
        // Add or update status
        await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: movie.id,
            movieTitle: movie.title,
            moviePosterPath: movie.poster_path,
            movieReleaseDate: movie.release_date,
            status: newStatus,
            userRating: rating,
            userComment: comment,
            tmdbRating: movie.vote_average
              ? Math.round(movie.vote_average)
              : null,
          }),
        });
      }
      setStatus(newStatus);
      updateMovieStatusCache(movieId, newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating movie status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen for manual refresh events (e.g., after review submission)
    const handleRefresh = () => {
      fetchStatus();
    };

    window.addEventListener('movieStatusChanged', handleRefresh);
    return () =>
      window.removeEventListener('movieStatusChanged', handleRefresh);
  }, [fetchStatus]);

  // Subscribe to status changes for this specific movie
  useEffect(() => {
    const { subscribeToStatusChanges } = useMovieCacheStore.getState();
    const unsubscribe = subscribeToStatusChanges(
      (changedMovieId, newStatus) => {
        if (changedMovieId === movieId) {
          // Status changed for this movie, update local state
          setStatus(newStatus);
          onStatusChange?.(newStatus);
        }
      }
    );

    return unsubscribe;
  }, [movieId, onStatusChange]);

  const rewatch = async (rating?: number, comment?: string) => {
    try {
      await fetch('/api/movies/rewatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          userRating: rating,
          userComment: comment,
        }),
      });
      setStatus('watched');
      updateMovieStatusCache(movieId, 'watched');
      onStatusChange?.('watched');
    } catch (error) {
      console.error('Error rewatching movie:', error);
    }
  };

  return { status, loading, updateStatus, rewatch };
}
