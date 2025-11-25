'use client';

import { useState } from 'react';
import { MovieCard } from './movie-card';
import { SearchComponent } from '@/components/ui/search-component';
import type { Movie } from '@/lib/tmdb';

interface MovieSearchProps {
  showResults?: boolean;
}

export default function MovieSearch({ showResults = true }: MovieSearchProps) {
  const [results, setResults] = useState<Movie[]>([]);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasActiveSearch(false);
      return;
    }

    setHasActiveSearch(true);
    try {
      const response = await fetch(
        `/api/movies/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const movies = data.results || [];
      setResults(movies);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for movies..."
          onSearch={handleSearchSubmit}
        />
      </div>

      {showResults && hasActiveSearch && (
        <>
          {results.length === 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              No movies found
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
