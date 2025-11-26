'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameCard } from './game-card';
import { Loading } from '@/components/ui/loading';
import { FiFilter } from 'react-icons/fi';
import { Dropdown } from '@/components/ui/dropdown';

type PlaylistFilter = 'all' | 'want_to_play' | 'playing' | 'completed';

interface PlaylistGame {
  id: string;
  gameId: number;
  gameName: string;
  gameSlug: string;
  gameBackgroundImage: string;
  gameReleased: string;
  rating: number | null;
  metacritic: number | null;
  playtime: number;
}

export default function PlaylistTab() {
  const [playlistFilter, setPlaylistFilter] = useState<PlaylistFilter>('all');
  const [playlistGames, setPlaylistGames] = useState<PlaylistGame[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylistGames = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        playlistFilter === 'all'
          ? '/api/games'
          : `/api/games?status=${playlistFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPlaylistGames(data.games || []);
      }
    } catch (error) {
      console.error('Error fetching playlist games:', error);
    } finally {
      setLoading(false);
    }
  }, [playlistFilter]);

  useEffect(() => {
    fetchPlaylistGames();
  }, [fetchPlaylistGames]);

  const filterOptions = [
    { value: 'all', label: 'All Games' },
    { value: 'want_to_play', label: 'Want to Play' },
    { value: 'playing', label: 'Playing' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Playlist</h2>
          <p className="text-muted-foreground mt-1">
            {playlistGames.length} game{playlistGames.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-muted-foreground" />
          <Dropdown
            options={filterOptions}
            value={playlistFilter}
            onChange={(value) => setPlaylistFilter(value as PlaylistFilter)}
            className="w-44"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : playlistGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlistGames.map((item) => (
            <GameCard
              key={item.id}
              game={{
                id: item.gameId,
                name: item.gameName,
                slug: item.gameSlug,
                background_image: item.gameBackgroundImage,
                released: item.gameReleased,
                rating: item.rating || 0,
                rating_top: 5,
                ratings: [],
                ratings_count: 0,
                reviews_text_count: 0,
                added: 0,
                metacritic: item.metacritic,
                playtime: item.playtime || 0,
                suggestions_count: 0,
                updated: '',
                esrb_rating: null,
                platforms: [],
                genres: [],
                tags: [],
                short_screenshots: [],
                tba: false,
              }}
              onStatusChange={fetchPlaylistGames}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No games in your playlist</p>
          <p className="text-sm mt-2">Add games from the Discover tab</p>
        </div>
      )}
    </div>
  );
}
