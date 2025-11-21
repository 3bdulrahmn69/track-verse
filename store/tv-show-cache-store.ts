import { create } from 'zustand';

export type TVShowStatus =
  | 'want_to_watch'
  | 'watching'
  | 'completed'
  | 'dropped'
  | null;

interface TVShowStatusCache {
  [tvShowId: number]: {
    status: TVShowStatus;
    watchedEpisodes?: number;
    totalEpisodes?: number;
    timestamp: number;
  };
}

type StatusChangeListener = (
  tvShowId: number,
  status: TVShowStatus,
  watchedEpisodes?: number,
  totalEpisodes?: number
) => void;

interface TVShowStatusData {
  status: TVShowStatus;
  watchedEpisodes?: number;
  totalEpisodes?: number;
}

interface TVShowCacheState {
  cache: TVShowStatusCache;
  pendingRequests: Map<number, Promise<TVShowStatusData>>;
  listeners: Set<StatusChangeListener>;
  getTVShowStatus: (tvShowId: number) => Promise<TVShowStatusData>;
  updateTVShowStatusCache: (
    tvShowId: number,
    status: TVShowStatus,
    watchedEpisodes?: number,
    totalEpisodes?: number
  ) => void;
  clearCache: () => void;
  subscribeToStatusChanges: (listener: StatusChangeListener) => () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTVShowCacheStore = create<TVShowCacheState>((set, get) => ({
  cache: {},
  pendingRequests: new Map(),
  listeners: new Set(),

  getTVShowStatus: async (tvShowId: number): Promise<TVShowStatusData> => {
    const state = get();
    const { cache, pendingRequests } = state;

    // Check if data is in cache and still valid
    const cached = cache[tvShowId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        status: cached.status,
        watchedEpisodes: cached.watchedEpisodes,
        totalEpisodes: cached.totalEpisodes,
      };
    }

    // Check if there's already a pending request for this TV show
    const pending = pendingRequests.get(tvShowId);
    if (pending) {
      return pending;
    }

    // Create new request
    const requestPromise: Promise<TVShowStatusData> = (async () => {
      try {
        const response = await fetch(`/api/tv-shows/${tvShowId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          const status = data.status || null;
          const watchedEpisodes = data.watchedEpisodes;
          const totalEpisodes = data.totalEpisodes;

          // Update cache
          set((state) => ({
            cache: {
              ...state.cache,
              [tvShowId]: {
                status,
                watchedEpisodes,
                totalEpisodes,
                timestamp: Date.now(),
              },
            },
          }));

          return { status, watchedEpisodes, totalEpisodes };
        }
        return { status: null };
      } catch (error) {
        console.error('Error fetching TV show status:', error);
        return { status: null };
      } finally {
        // Remove from pending requests
        const currentState = get();
        currentState.pendingRequests.delete(tvShowId);
      }
    })();

    // Store pending request
    pendingRequests.set(tvShowId, requestPromise);

    return requestPromise;
  },

  updateTVShowStatusCache: (
    tvShowId: number,
    status: TVShowStatus,
    watchedEpisodes?: number,
    totalEpisodes?: number
  ) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [tvShowId]: {
          status,
          watchedEpisodes,
          totalEpisodes,
          timestamp: Date.now(),
        },
      },
    }));

    // Notify all listeners
    const { listeners } = get();
    listeners.forEach((listener) => {
      listener(tvShowId, status, watchedEpisodes, totalEpisodes);
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
