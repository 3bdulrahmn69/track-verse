'use client';

import { useState, useCallback } from 'react';
import { MovieCard } from './movie-card';
import { SearchComponent } from '@/components/ui/search-component';
import type { Movie } from '@/lib/tmdb';

interface DiscoverTabProps {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
}

export default function DiscoverTab({
  popularMovies,
  nowPlayingMovies,
}: DiscoverTabProps) {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  const handleSearchSubmit = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasActiveSearch(false);
      return;
    }

    setHasActiveSearch(true);
    try {
      const response = await fetch(
        `/api/movies/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for movies..."
          onSearch={handleSearchSubmit}
        />
      </div>

      {/* Search Results */}
      {hasActiveSearch && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No movies found
            </p>
          )}
        </div>
      )}

      {/* Discover Content */}
      {!hasActiveSearch && (
        <>
          {/* Now Playing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Now Playing
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {nowPlayingMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>

          {/* Popular Movies */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Popular Movies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
