import { create } from 'zustand';

export type GameStatus = 'want_to_play' | 'playing' | 'completed' | null;

interface GameStatusCache {
  [gameId: number]: {
    status: GameStatus;
    rating?: number | null;
    avgPlaytime?: number | null;
    timestamp: number;
  };
}

type StatusChangeListener = (gameId: number, status: GameStatus) => void;

interface GameCacheState {
  cache: GameStatusCache;
  pendingRequests: Map<number, Promise<GameStatus>>;
  listeners: Set<StatusChangeListener>;
  getGameStatus: (gameId: number) => Promise<GameStatus>;
  updateGameStatusCache: (
    gameId: number,
    status: GameStatus,
    rating?: number | null,
    avgPlaytime?: number | null
  ) => void;
  clearCache: () => void;
  subscribeToStatusChanges: (listener: StatusChangeListener) => () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useGameCacheStore = create<GameCacheState>((set, get) => ({
  cache: {},
  pendingRequests: new Map(),
  listeners: new Set(),

  getGameStatus: async (gameId: number): Promise<GameStatus> => {
    const state = get();
    const { cache, pendingRequests } = state;

    // Check if data is in cache and still valid
    const cached = cache[gameId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.status;
    }

    // Check if there's already a pending request for this game
    const pending = pendingRequests.get(gameId);
    if (pending) {
      return pending;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/games?gameId=${gameId}`);
        if (response.ok) {
          const data = await response.json();
          const userGame = data.games?.find(
            (g: { gameId: number }) => g.gameId === gameId
          );
          const status = userGame?.status || null;
          const rating = userGame?.rating;
          const avgPlaytime = userGame?.avgPlaytime;

          // Update cache
          set((state) => ({
            cache: {
              ...state.cache,
              [gameId]: {
                status,
                rating,
                avgPlaytime,
                timestamp: Date.now(),
              },
            },
          }));

          return status;
        }
        return null;
      } catch (error) {
        console.error('Error fetching game status:', error);
        return null;
      } finally {
        // Remove from pending requests
        const currentState = get();
        currentState.pendingRequests.delete(gameId);
      }
    })();

    // Store the promise in pending requests
    get().pendingRequests.set(gameId, requestPromise);

    return requestPromise;
  },

  updateGameStatusCache: (
    gameId: number,
    status: GameStatus,
    rating?: number | null,
    avgPlaytime?: number | null
  ) => {
    set((state) => {
      const existing = state.cache[gameId];
      return {
        cache: {
          ...state.cache,
          [gameId]: {
            status,
            rating: rating !== undefined ? rating : existing?.rating,
            avgPlaytime:
              avgPlaytime !== undefined ? avgPlaytime : existing?.avgPlaytime,
            timestamp: Date.now(),
          },
        },
      };
    });

    // Notify all listeners
    const { listeners } = get();
    listeners.forEach((listener) => listener(gameId, status));
  },

  clearCache: () => {
    set({ cache: {}, pendingRequests: new Map() });
  },

  subscribeToStatusChanges: (listener: StatusChangeListener) => {
    const { listeners } = get();
    listeners.add(listener);

    // Return unsubscribe function
    return () => {
      const { listeners } = get();
      listeners.delete(listener);
    };
  },
}));
