'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiAlertCircle } from 'react-icons/fi';
import { Book, getWorkId } from '@/lib/books';
import { BookCard } from './book-card';
import type { UserBook } from '@/lib/db/schema';
import { useBookCacheStore } from '@/store/book-cache-store';

export function ReadListTab() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribeToStatusChanges = useBookCacheStore(
    (state) => state.subscribeToStatusChanges
  );

  useEffect(() => {
    const fetchReadList = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/books?status=want_to_read');

        if (!response.ok) {
          throw new Error('Failed to fetch read list');
        }

        const data = await response.json();

        // Transform the database records to Book objects
        const convertedBooks: Book[] = data.books.map((record: UserBook) => ({
          key: record.bookId,
          title: record.bookTitle,
          cover_i: record.bookCoverId || undefined,
          author_name: record.bookAuthors
            ? JSON.parse(record.bookAuthors)
            : undefined,
          first_publish_year: record.bookFirstPublishYear || undefined,
        }));

        setBooks(convertedBooks);
      } catch (err) {
        console.error('Error fetching read list:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load read list'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReadList();
  }, []);

  const handleStatusChange = (
    bookId: string,
    newStatus: 'want_to_read' | 'read' | null
  ) => {
    // Remove book from read list if it's no longer in want_to_read status
    if (newStatus !== 'want_to_read') {
      setBooks((prev) => prev.filter((book) => getWorkId(book.key) !== bookId));
    }
  };

  // Subscribe to status changes from cache
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(async (bookId, status) => {
      if (status === 'want_to_read') {
        // Check if book is already in the list
        const exists = books.some((b) => getWorkId(b.key) === bookId);
        if (!exists) {
          // Fetch the book details to add to read list
          try {
            const response = await fetch(`/api/books?bookId=${bookId}`);
            if (response.ok) {
              const data = await response.json();
              const bookRecord = data.books?.find(
                (b: UserBook) => b.bookId === bookId
              );
              if (bookRecord) {
                const newBook: Book = {
                  key: bookRecord.bookId,
                  title: bookRecord.bookTitle,
                  cover_i: bookRecord.bookCoverId || undefined,
                  author_name: bookRecord.bookAuthors
                    ? JSON.parse(bookRecord.bookAuthors)
                    : undefined,
                  first_publish_year:
                    bookRecord.bookFirstPublishYear || undefined,
                };
                setBooks((prev) => [newBook, ...prev]);
              }
            }
          } catch (error) {
            console.error('Error fetching book details:', error);
          }
        }
      } else {
        // Remove from read list if status changed to read or null
        setBooks((prev) => prev.filter((b) => getWorkId(b.key) !== bookId));
      }
    });

    return () => unsubscribe();
  }, [subscribeToStatusChanges, books]);

  if (loading) {
    return (
      <div>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your read list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Error Loading Read List
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {books.length === 0 ? (
        <div className="text-center py-16">
          <FiBook className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Your Read List is Empty
          </h3>
          <p className="text-muted-foreground">
            Start adding books you want to read!
          </p>
        </div>
      ) : (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            My Read List ({books.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.key}
                book={book}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
