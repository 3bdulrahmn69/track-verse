import { create } from 'zustand';

export type BookStatus = 'want_to_read' | 'read' | null;

interface BookStatusCache {
  [bookId: string]: {
    status: BookStatus;
    timestamp: number;
  };
}

type StatusChangeListener = (bookId: string, status: BookStatus) => void;

interface BookCacheState {
  cache: BookStatusCache;
  pendingRequests: Map<string, Promise<BookStatus>>;
  listeners: Set<StatusChangeListener>;
  getBookStatus: (bookId: string) => Promise<BookStatus>;
  updateBookStatusCache: (bookId: string, status: BookStatus) => void;
  clearCache: () => void;
  subscribeToStatusChanges: (listener: StatusChangeListener) => () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useBookCacheStore = create<BookCacheState>((set, get) => ({
  cache: {},
  pendingRequests: new Map(),
  listeners: new Set(),

  getBookStatus: async (bookId: string): Promise<BookStatus> => {
    const state = get();
    const { cache, pendingRequests } = state;

    // Check if data is in cache and still valid
    const cached = cache[bookId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.status;
    }

    // Check if there's already a pending request for this book
    const pending = pendingRequests.get(bookId);
    if (pending) {
      return pending;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/books?bookId=${bookId}`);
        if (response.ok) {
          const data = await response.json();
          const userBook = data.books?.find(
            (b: { bookId: string }) => b.bookId === bookId
          );
          const status = userBook?.status || null;

          // Update cache
          set((state) => ({
            cache: {
              ...state.cache,
              [bookId]: {
                status,
                timestamp: Date.now(),
              },
            },
          }));

          return status;
        }
        return null;
      } catch (error) {
        console.error('Error fetching book status:', error);
        return null;
      } finally {
        // Remove from pending requests
        const currentState = get();
        currentState.pendingRequests.delete(bookId);
      }
    })();

    // Store pending request
    pendingRequests.set(bookId, requestPromise);

    return requestPromise;
  },

  updateBookStatusCache: (bookId: string, status: BookStatus) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [bookId]: {
          status,
          timestamp: Date.now(),
        },
      },
    }));

    // Notify all listeners
    const { listeners } = get();
    listeners.forEach((listener) => {
      listener(bookId, status);
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
