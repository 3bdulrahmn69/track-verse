import { useState, useEffect, useCallback } from 'react';
import { Book } from '@/lib/books';
import { useBookCacheStore, type BookStatus } from '@/store/book-cache-store';

export type { BookStatus };

export function useBookStatus(
  bookId: string,
  onStatusChange?: (status: BookStatus) => void
) {
  const [status, setStatus] = useState<BookStatus>(null);
  const [loading, setLoading] = useState(true);
  const { getBookStatus, updateBookStatusCache } = useBookCacheStore();

  const fetchStatus = useCallback(async () => {
    try {
      const cachedStatus = await getBookStatus(bookId);
      setStatus(cachedStatus);
    } catch (error) {
      console.error('Error fetching book status:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, getBookStatus]);

  useEffect(() => {
    fetchStatus();

    // Listen for manual refresh events (e.g., after review submission)
    const handleRefresh = () => {
      fetchStatus();
    };

    window.addEventListener('bookStatusChanged', handleRefresh);
    return () => window.removeEventListener('bookStatusChanged', handleRefresh);
  }, [fetchStatus]);

  // Subscribe to status changes for this specific book
  useEffect(() => {
    const { subscribeToStatusChanges } = useBookCacheStore.getState();
    const unsubscribe = subscribeToStatusChanges((changedBookId, newStatus) => {
      if (changedBookId === bookId) {
        // Status changed for this book, update local state
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    });

    return unsubscribe;
  }, [bookId, onStatusChange]);

  const updateStatus = async (
    newStatus: BookStatus,
    book: Book,
    rating?: number,
    comment?: string
  ) => {
    if (newStatus === null) {
      // Remove from list
      const response = await fetch(`/api/books?bookId=${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove book');
      }
    } else {
      // Add or update status
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          bookTitle: book.title,
          bookCoverId: book.cover_i || null,
          bookAuthors: book.author_name || [],
          bookFirstPublishYear: book.first_publish_year || null,
          status: newStatus,
          userRating: rating,
          userComment: comment,
          totalPages: book.number_of_pages_median || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update book status');
      }
    }

    setStatus(newStatus);
    updateBookStatusCache(bookId, newStatus);
    onStatusChange?.(newStatus);
  };

  return {
    status,
    loading,
    updateStatus,
    refetch: fetchStatus,
  };
}
