'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTrendingBooks, getBooksBySubject, Book } from '@/lib/books';
import { BookCard } from './book-card';
import { SearchComponent } from '@/components/ui/search-component';
import { Tabs } from '@/components/ui/tabs';

const SUBJECTS = [
  { id: 'art', label: 'Art' },
  { id: 'science_fiction', label: 'Science Fiction' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'biographies', label: 'Biographies' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'romance', label: 'Romance' },
  { id: 'textbooks', label: 'Textbooks' },
  { id: 'children', label: 'Children' },
  { id: 'history', label: 'History' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'religion', label: 'Religion' },
  { id: 'mystery_and_detective_stories', label: 'Mystery' },
  { id: 'plays', label: 'Plays' },
  { id: 'music', label: 'Music' },
  { id: 'science', label: 'Science' },
];

export function DiscoverTab() {
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [subjectBooks, setSubjectBooks] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [activeSubject, setActiveSubject] = useState('romance');
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        const data = await getTrendingBooks(25);
        setTrendingBooks(data.docs);
      } catch (error) {
        console.error('Error fetching trending books:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  useEffect(() => {
    const fetchSubjectBooks = async () => {
      setSubjectLoading(true);
      try {
        const data = await getBooksBySubject(activeSubject, 25);
        setSubjectBooks(data.docs);
      } catch (error) {
        console.error('Error fetching subject books:', error);
        setSubjectBooks([]);
      } finally {
        setSubjectLoading(false);
      }
    };

    fetchSubjectBooks();
  }, [activeSubject]);

  const handleSearchSubmit = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasActiveSearch(false);
      return;
    }

    setHasActiveSearch(true);
    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.docs || []);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchComponent
          placeholder="Search for books by title, author, or ISBN..."
          onSearch={handleSearchSubmit}
        />
      </div>

      {/* Search Results */}
      {hasActiveSearch && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No books found
            </p>
          )}
        </div>
      )}

      {/* Discover Content */}
      {!hasActiveSearch && (
        <>
          {/* Trending Books */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Trending Books
            </h2>

            {trendingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : trendingBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No books available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {trendingBooks.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            )}
          </section>

          {/* Books by Subject */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Browse by Subject
            </h2>

            <Tabs
              tabs={SUBJECTS}
              activeTab={activeSubject}
              onTabChange={setActiveSubject}
              className="mb-6"
            />

            {subjectLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : subjectBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No books found for this subject.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {subjectBooks.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
