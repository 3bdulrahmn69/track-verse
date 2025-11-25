'use client';

import { useState, useEffect } from 'react';
import {
  FiBookmark,
  FiAlertCircle,
  FiCalendar,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { MovieCard } from './movie-card';
import type { Movie } from '@/lib/tmdb';
import type { UserMovie } from '@/lib/db/schema';
import { useMovieCacheStore } from '@/store/movie-cache-store';
import { Dropdown } from '@/components/ui/dropdown';
import { Loading } from '@/components/ui/loading';

export default function WatchListTab() {
  const [watchListMovies, setWatchListMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribeToStatusChanges = useMovieCacheStore(
    (state) => state.subscribeToStatusChanges
  );

  const [sortBy, setSortBy] = useState<'added' | 'name' | 'rating'>('added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
                  runtime: movieRecord.runtime || 0,
                  imdb_id: movieRecord.imdbId,
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

  const getSortedMovies = () => {
    const movies = [...watchListMovies];

    return movies.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'added':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = (b.vote_average || 0) - (a.vote_average || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const sortedMovies = getSortedMovies();

  if (loading) {
    return <Loading text="Loading your watch list..." />;
  }

  if (error) {
    return (
      <div>
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
            {sortedMovies.length} movie{sortedMovies.length !== 1 ? 's' : ''} to
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
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded transition-colors text-muted-foreground hover:text-foreground"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Movies Display */}
      {sortedMovies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FiBookmark className="text-6xl mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Your watch list is empty
          </h3>
          <p className="text-muted-foreground max-w-md">
            Add movies you want to watch from the Discover tab to keep track of
            them here!
          </p>
        </div>
      )}
    </div>
  );
}
