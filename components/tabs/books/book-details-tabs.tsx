'use client';

import { useState } from 'react';
import { FiBook, FiMessageSquare } from 'react-icons/fi';
import { Tabs } from '@/components/ui/tabs';
import { BookCard } from '@/components/tabs/books/book-card';
import { BookComments } from './book-comments';
import { Book } from '@/lib/books';
interface BookDetailsTabsProps {
  bookId: string;
  bookTitle: string;
  similarBooks: Book[];
}

export function BookDetailsTabs({
  bookId,
  bookTitle,
  similarBooks,
}: BookDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('similar');

  const tabs = [
    {
      id: 'similar',
      label: 'Similar Books',
      icon: <FiBook className="w-4 h-4" />,
    },
    {
      id: 'comments',
      label: 'Reviews',
      icon: <FiMessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      <div>
        {activeTab === 'similar' && (
          <div>
            {similarBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {similarBooks.slice(0, 10).map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">
                  No similar books found
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <BookComments bookId={bookId} bookTitle={bookTitle} />
        )}
      </div>
    </div>
  );
}
