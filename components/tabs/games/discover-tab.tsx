'use client';

import { useState, useEffect } from 'react';
import { GameCard } from './game-card';
import GameSearch from './game-search';
import type { Game } from '@/lib/rawg';
import { Loading } from '@/components/ui/loading';

export default function DiscoverTab() {
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    fetchPopularGames();
    fetchRecentGames();
  }, []);

  const fetchPopularGames = async () => {
    setLoadingPopular(true);
    try {
      const response = await fetch('/api/games/discover?type=popular');
      if (response.ok) {
        const data = await response.json();
        setPopularGames(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching popular games:', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  const fetchRecentGames = async () => {
    setLoadingRecent(true);
    try {
      const response = await fetch('/api/games/discover?type=recent');
      if (response.ok) {
        const data = await response.json();
        setRecentGames(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching recent games:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  return (
    <div>
      <GameSearch />

      {/* Popular Games Section */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Popular Games
        </h2>
        {loadingPopular ? (
          <Loading />
        ) : popularGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No popular games found</p>
          </div>
        )}
      </section>

      {/* Recent Games Section */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Recent Releases
        </h2>
        {loadingRecent ? (
          <Loading />
        ) : recentGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recent games found</p>
          </div>
        )}
      </section>
    </div>
  );
}
