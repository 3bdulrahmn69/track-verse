import { useState, useEffect, useCallback } from 'react';
import type { Game } from '@/lib/rawg';
import { useGameCacheStore, type GameStatus } from '@/store/game-cache-store';

export type { GameStatus };

interface GameUpdatePayload {
  gameId: number;
  gameName: string;
  gameSlug: string;
  gameBackgroundImage: string | null;
  gameReleased: string;
  status: GameStatus;
  avgPlaytime: number | null;
  metacritic: number | null;
  rating?: number | null;
}

export function useGameStatus(
  gameId: number,
  onStatusChange?: (newStatus: GameStatus) => void
) {
  const [status, setStatus] = useState<GameStatus>(null);
  const [loading, setLoading] = useState(true);
  const { getGameStatus, updateGameStatusCache } = useGameCacheStore();

  const fetchStatus = useCallback(async () => {
    try {
      const cachedStatus = await getGameStatus(gameId);
      setStatus(cachedStatus);
    } catch (error) {
      console.error('Error fetching game status:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId, getGameStatus]);

  const updateStatus = async (
    newStatus: GameStatus,
    game: Game,
    rating?: number | null,
    avgPlaytime?: number | null
  ) => {
    console.log('useGameStatus.updateStatus called with:', {
      newStatus,
      gameId: game.id,
      gameName: game.name,
      rating,
      avgPlaytime,
      ratingType: typeof rating,
      ratingIsNull: rating === null,
    });

    if (newStatus === null) {
      // Remove from list
      const response = await fetch(`/api/games?gameId=${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove game');
      }
    } else {
      // Add or update status
      const payload: GameUpdatePayload = {
        gameId: game.id,
        gameName: game.name,
        gameSlug: game.slug,
        gameBackgroundImage: game.background_image,
        gameReleased: game.released,
        status: newStatus,
        avgPlaytime:
          avgPlaytime !== undefined ? avgPlaytime : game.playtime || null,
        metacritic: game.metacritic,
      };

      // Only include rating if it's explicitly provided and not null
      if (rating !== undefined && rating !== null) {
        payload.rating = rating;
      }

      console.log('Sending payload to API:', payload);

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update game status');
      }

      const result = await response.json();
      console.log('API response:', result);
    }

    setStatus(newStatus);
    updateGameStatusCache(gameId, newStatus, rating, avgPlaytime);
    onStatusChange?.(newStatus);
  };

  useEffect(() => {
    fetchStatus();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchStatus();
    };

    window.addEventListener('gameStatusChanged', handleRefresh);
    return () => window.removeEventListener('gameStatusChanged', handleRefresh);
  }, [fetchStatus]);

  // Subscribe to status changes for this specific game
  useEffect(() => {
    const { subscribeToStatusChanges } = useGameCacheStore.getState();
    const unsubscribe = subscribeToStatusChanges((changedGameId, newStatus) => {
      if (changedGameId === gameId) {
        // Status changed for this game, update local state
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    });

    return () => unsubscribe();
  }, [gameId, onStatusChange]);

  return { status, loading, updateStatus, refetch: fetchStatus };
}
