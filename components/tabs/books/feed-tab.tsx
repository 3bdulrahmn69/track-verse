'use client';

import { useState, useEffect } from 'react';
import { FiBook } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { getCoverUrl, getWorkId } from '@/lib/books';
import { Avatar } from '@/components/ui/avatar';

interface FeedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverId: number | null;
  bookAuthors: string | null;
  bookFirstPublishYear: number | null;
  status: 'want_to_read' | 'read';
  userRating: number | null;
  userComment: string | null;
  pagesRead: number | null;
  totalPages: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    image: string | null;
  };
}

export function FeedTab() {
  const [books, setBooks] = useState<FeedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('/api/feed/books');
        const data = await response.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error('Error fetching books feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FiBook className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Activity Yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Follow users to see their reading activity here. Start by discovering
          books and connecting with other readers!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((item) => {
        const authors = item.bookAuthors ? JSON.parse(item.bookAuthors) : [];
        const workId = getWorkId(item.bookId);

        return (
          <div
            key={item.id}
            className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex gap-4">
              {/* Book Cover */}
              <Link
                href={`/books/${workId}`}
                className="shrink-0 block hover:opacity-80 transition-opacity"
              >
                <div className="relative w-24 h-36 rounded-md overflow-hidden shadow-md bg-muted">
                  <Image
                    src={getCoverUrl(item.bookCoverId || undefined, 'M')}
                    alt={item.bookTitle}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/users/${item.user.username}`}>
                    <Avatar
                      src={item.user.image}
                      alt={item.user.fullname}
                      size="sm"
                      className="w-8 h-8"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/users/${item.user.username}`}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {item.user.fullname}
                    </Link>
                    <span className="text-muted-foreground mx-2">
                      {item.status === 'read'
                        ? 'finished reading'
                        : 'wants to read'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {formatDate(item.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <Link href={`/books/${workId}`}>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1">
                    {item.bookTitle}
                  </h3>
                </Link>

                {authors.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-2">
                    by {authors.join(', ')}
                  </p>
                )}

                {/* Rating */}
                {item.status === 'read' && item.userRating && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-warning text-sm">★</span>
                    <span className="text-sm font-medium text-foreground">
                      {item.userRating}/5
                    </span>
                  </div>
                )}

                {/* Comment */}
                {item.userComment && (
                  <p className="text-sm text-foreground line-clamp-3 bg-muted/50 p-3 rounded-lg">
                    {item.userComment}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
