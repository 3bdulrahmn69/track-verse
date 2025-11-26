'use client';

import { useState } from 'react';
import { GameCard } from './game-card';
import { SearchComponent } from '@/components/ui/search-component';
import type { Game } from '@/lib/rawg';

interface GameSearchProps {
  showResults?: boolean;
}

export default function GameSearch({ showResults = true }: GameSearchProps) {
  const [results, setResults] = useState<Game[]>([]);
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
        `/api/games/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const games = data.results || [];
      setResults(games);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for games..."
          onSearch={handleSearchSubmit}
        />
      </div>

      {showResults && hasActiveSearch && (
        <>
          {results.length === 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              No games found
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
