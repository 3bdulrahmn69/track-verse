'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Movie } from '@/lib/tmdb';

export type MovieStatus = 'want_to_watch' | 'watched' | null;

interface UserMovie {
  id: string;
  movieId: number;
  status: MovieStatus;
}

export function useMovieStatus(
  movieId: number,
  onStatusChange?: (newStatus: MovieStatus) => void
) {
  const [status, setStatus] = useState<MovieStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/movies?movieId=${movieId}`);
      if (response.ok) {
        const data = await response.json();
        const userMovie = data.movies?.find(
          (m: UserMovie) => m.movieId === movieId
        );
        setStatus(userMovie?.status || null);
      }
    } catch (error) {
      console.error('Error fetching movie status:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const updateStatus = async (newStatus: MovieStatus, movie: Movie) => {
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
          }),
        });
      }
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating movie status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const rewatch = async () => {
    try {
      await fetch('/api/movies/rewatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
      });
      setStatus('watched');
      onStatusChange?.('watched');
    } catch (error) {
      console.error('Error rewatching movie:', error);
    }
  };

  return { status, loading, updateStatus, rewatch };
}
