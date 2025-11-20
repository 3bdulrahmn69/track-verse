'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { MovieCard } from './movie-card';
import { useDebounce } from '@/hooks/useDebounce';
import type { Movie } from '@/lib/tmdb';

interface MovieSearchProps {
  showResults?: boolean;
}

export default function MovieSearch({ showResults = true }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/movies/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      const movies = data.results || [];
      setResults(movies);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search when debounced query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const hasActiveSearch = query.trim().length > 0;

  return (
    <div className="mb-8">
      <div className="relative max-w-2xl mx-auto">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={handleInputChange}
          className="pl-12 pr-12 py-3 w-full rounded-full border-2 border-border focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && hasActiveSearch && (
        <>
          {isSearching && (
            <div className="text-center mt-8 text-muted-foreground">
              Searching...
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              No movies found for &quot;{query}&quot;
            </div>
          )}

          {!isSearching && results.length > 0 && (
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
