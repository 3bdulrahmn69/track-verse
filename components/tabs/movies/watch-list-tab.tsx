'use client';

import { useState, useEffect } from 'react';
import { FiBookmark, FiAlertCircle } from 'react-icons/fi';
import { MovieCard } from './movie-card';
import MovieSearch from './movie-search';
import type { Movie } from '@/lib/tmdb';
import type { UserMovie } from '@/lib/db/schema';
import { useMovieCacheStore } from '@/store/movie-cache-store';

export default function WatchListTab() {
  const [watchListMovies, setWatchListMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribeToStatusChanges = useMovieCacheStore(
    (state) => state.subscribeToStatusChanges
  );

  const handleStatusChange = (
    movieId: number,
    newStatus: 'want_to_watch' | 'watched' | null
  ) => {
    // Remove movie from watch list if it's no longer in want_to_watch status
    if (newStatus !== 'want_to_watch') {
      setWatchListMovies((prev) =>
        prev.filter((movie) => movie.id !== movieId)
      );
    }
  };

  // Subscribe to status changes from cache
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(async (movieId, status) => {
      if (status === 'want_to_watch') {
        // Check if movie is already in the list
        const exists = watchListMovies.some((m) => m.id === movieId);
        if (!exists) {
          // Fetch the movie details to add to watchlist
          try {
            const response = await fetch(`/api/movies?movieId=${movieId}`);
            if (response.ok) {
              const data = await response.json();
              const movieRecord = data.movies?.find(
                (m: UserMovie) => m.movieId === movieId
              );
              if (movieRecord) {
                const newMovie: Movie = {
                  id: movieRecord.movieId,
                  title: movieRecord.movieTitle,
                  poster_path: movieRecord.moviePosterPath,
                  backdrop_path: null,
                  release_date: movieRecord.movieReleaseDate,
                  overview: '',
                  vote_average: movieRecord.tmdbRating || 0,
                  vote_count: 0,
                  popularity: 0,
                  genre_ids: [],
                };
                setWatchListMovies((prev) => [newMovie, ...prev]);
              }
            }
          } catch (error) {
            console.error('Error fetching movie details:', error);
          }
        }
      } else {
        // Remove from watchlist if status changed to watched or null
        setWatchListMovies((prev) => prev.filter((m) => m.id !== movieId));
      }
    });

    return () => unsubscribe();
  }, [subscribeToStatusChanges, watchListMovies]);

  useEffect(() => {
    const fetchWatchList = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/movies?status=want_to_watch');

        if (!response.ok) {
          throw new Error('Failed to fetch watch list');
        }

        const data = await response.json();

        // Transform the database records to Movie objects
        const movies: Movie[] = data.movies.map((record: UserMovie) => ({
          id: record.movieId,
          title: record.movieTitle,
          poster_path: record.moviePosterPath,
          backdrop_path: null, // Not stored in DB
          release_date: record.movieReleaseDate,
          overview: '', // Not stored in DB
          vote_average: record.tmdbRating || 0,
          vote_count: 0, // Not stored in DB
          popularity: 0, // Not stored in DB
          genre_ids: [], // Not stored in DB
        }));

        setWatchListMovies(movies);
      } catch (err) {
        console.error('Error fetching watch list:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load watch list'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWatchList();
  }, []);

  if (loading) {
    return (
      <div>
        <MovieSearch />
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your watch list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <MovieSearch />
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Error Loading Watch List
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MovieSearch />

      {watchListMovies.length === 0 ? (
        <div className="text-center py-16">
          <FiBookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Your Watch List is Empty
          </h3>
          <p className="text-muted-foreground">
            Start adding movies you want to watch!
          </p>
        </div>
      ) : (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            My Watch List ({watchListMovies.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchListMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
