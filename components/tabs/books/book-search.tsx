'use client';

import { useState } from 'react';
import { Book } from '@/lib/books';
import { BookCard } from './book-card';
import { SearchComponent } from '@/components/ui/search-component';

interface BookSearchProps {
  showResults?: boolean;
}

export function BookSearch({ showResults = true }: BookSearchProps) {
  const [results, setResults] = useState<Book[]>([]);
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
        `/api/books/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.docs || []);
    } catch (error) {
      console.error('Error searching books:', error);
      setResults([]);
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for books by title, author, or ISBN..."
          onSearch={handleSearchSubmit}
        />
      </div>

      {showResults && hasActiveSearch && (
        <>
          {results.length === 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              No books found
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
