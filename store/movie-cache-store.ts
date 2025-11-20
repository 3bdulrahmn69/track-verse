import { create } from 'zustand';

export type MovieStatus = 'want_to_watch' | 'watched' | null;

interface MovieStatusCache {
  [movieId: number]: {
    status: MovieStatus;
    timestamp: number;
  };
}

type StatusChangeListener = (movieId: number, status: MovieStatus) => void;

interface MovieCacheState {
  cache: MovieStatusCache;
  pendingRequests: Map<number, Promise<MovieStatus>>;
  listeners: Set<StatusChangeListener>;
  getMovieStatus: (movieId: number) => Promise<MovieStatus>;
  updateMovieStatusCache: (movieId: number, status: MovieStatus) => void;
  clearCache: () => void;
  subscribeToStatusChanges: (listener: StatusChangeListener) => () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMovieCacheStore = create<MovieCacheState>((set, get) => ({
  cache: {},
  pendingRequests: new Map(),
  listeners: new Set(),

  getMovieStatus: async (movieId: number): Promise<MovieStatus> => {
    const state = get();
    const { cache, pendingRequests } = state;

    // Check if data is in cache and still valid
    const cached = cache[movieId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.status;
    }

    // Check if there's already a pending request for this movie
    const pending = pendingRequests.get(movieId);
    if (pending) {
      return pending;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/movies?movieId=${movieId}`);
        if (response.ok) {
          const data = await response.json();
          const userMovie = data.movies?.find(
            (m: { movieId: number }) => m.movieId === movieId
          );
          const status = userMovie?.status || null;

          // Update cache
          set((state) => ({
            cache: {
              ...state.cache,
              [movieId]: {
                status,
                timestamp: Date.now(),
              },
            },
          }));

          return status;
        }
        return null;
      } catch (error) {
        console.error('Error fetching movie status:', error);
        return null;
      } finally {
        // Remove from pending requests
        const currentState = get();
        currentState.pendingRequests.delete(movieId);
      }
    })();

    // Store pending request
    pendingRequests.set(movieId, requestPromise);

    return requestPromise;
  },

  updateMovieStatusCache: (movieId: number, status: MovieStatus) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [movieId]: {
          status,
          timestamp: Date.now(),
        },
      },
    }));

    // Notify all listeners
    const { listeners } = get();
    listeners.forEach((listener) => {
      listener(movieId, status);
    });
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

  clearCache: () => {
    const { pendingRequests } = get();
    pendingRequests.clear();
    set({ cache: {} });
  },
}));
