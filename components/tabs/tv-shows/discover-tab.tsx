'use client';

import { useState, useEffect } from 'react';
import { TVShow } from '@/lib/tmdb';
import { TVShowCard } from './tv-show-card';
import { SearchComponent } from '@/components/ui/search-component';

export default function DiscoverTab() {
  const [popularShows, setPopularShows] = useState<TVShow[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<TVShow[]>([]);
  const [searchResults, setSearchResults] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  useEffect(() => {
    fetchInitialShows();
  }, []);

  const fetchInitialShows = async () => {
    try {
      setLoading(true);
      const [popularResponse, topRatedResponse] = await Promise.all([
        fetch('/api/tv-shows/discover?type=popular'),
        fetch('/api/tv-shows/discover?type=top_rated'),
      ]);

      const popular = await popularResponse.json();
      const topRated = await topRatedResponse.json();

      setPopularShows(popular.results || []);
      setTopRatedShows(topRated.results || []);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasActiveSearch(false);
      return;
    }

    setHasActiveSearch(true);
    try {
      const response = await fetch(
        `/api/tv-shows/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching TV shows:', error);
      setSearchResults([]);
    }
  };

  const handleStatusChange = (
    tvShowId: number,
    newStatus:
      | 'want_to_watch'
      | 'watching'
      | 'completed'
      | 'stopped_watching'
      | null
  ) => {
    // Update local state if needed
    console.log(`TV Show ${tvShowId} status changed to ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for TV shows..."
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {searchResults.map((show) => (
                <TVShowCard
                  key={show.id}
                  tvShow={show}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No TV shows found
            </p>
          )}
        </div>
      )}

      {/* Popular TV Shows */}
      {!hasActiveSearch && (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Popular TV Shows
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {popularShows.map((show) => (
                <TVShowCard
                  key={show.id}
                  tvShow={show}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>

          {/* Top Rated TV Shows */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Top Rated TV Shows
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {topRatedShows.map((show) => (
                <TVShowCard
                  key={show.id}
                  tvShow={show}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
