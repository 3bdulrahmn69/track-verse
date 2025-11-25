'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiBookmark, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Book, getCoverUrl, getWorkId } from '@/lib/books';
import { useState } from 'react';
import { useBookStatus } from '@/hooks/use-book-status';
import { Popover } from '@/components/ui/popover';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BookCardProps {
  book: Book;
  onStatusChange?: (
    bookId: string,
    newStatus: 'want_to_read' | 'read' | null
  ) => void;
}

export function BookCard({ book, onStatusChange }: BookCardProps) {
  const bookId = getWorkId(book.key);
  const { status, loading, updateStatus } = useBookStatus(
    bookId,
    (newStatus) => {
      onStatusChange?.(bookId, newStatus);
    }
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showUnreadConfirm, setShowUnreadConfirm] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_read' | 'read' | null,
    rating?: number,
    comment?: string
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, book, rating, comment);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToReadList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('want_to_read');
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('read');
    setShowRatingDialog(true);
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    setIsUpdating(true);
    try {
      if (status === 'read') {
        await updateStatus('read', book, rating, comment);
      }
    } finally {
      setIsUpdating(false);
      setShowRatingDialog(false);
    }
  };

  const handleRemoveFromReadList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate(null);
  };

  const handleUnreadConfirm = async () => {
    setIsUpdating(true);
    try {
      await updateStatus(null, book);
      setShowUnreadConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Link
        href={`/books/${bookId}`}
        className="group relative overflow-hidden rounded-lg bg-card shadow-lg hover:shadow-xl transition-all duration-300 block"
      >
        <div className="relative aspect-2/3 overflow-hidden">
          <Image
            src={getCoverUrl(book.cover_i, 'M')}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized
          />

          {/* Action Buttons - Left Side */}
          <div className="absolute left-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {loading || isUpdating ? (
              <div className="p-2 rounded-full bg-background shadow-lg">
                <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : status === null ? (
              <>
                <Popover content="Add to Read List" position="right">
                  <button
                    onClick={handleAddToReadList}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiBookmark className="w-4 h-4 text-primary" />
                  </button>
                </Popover>
                <Popover content="Mark as Read" position="right">
                  <button
                    onClick={handleMarkAsRead}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiCheck className="w-4 h-4 text-success" />
                  </button>
                </Popover>
              </>
            ) : status === 'want_to_read' ? (
              <>
                <Popover content="In Read List" position="right">
                  <button
                    onClick={handleRemoveFromReadList}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiBookmark className="w-4 h-4 text-primary fill-current" />
                  </button>
                </Popover>
                <Popover content="Mark as Read" position="right">
                  <button
                    onClick={handleMarkAsRead}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiCheck className="w-4 h-4 text-success" />
                  </button>
                </Popover>
              </>
            ) : (
              <>
                <Popover content="Rate & Review" position="right">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRatingDialog(true);
                    }}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiStar className="w-4 h-4 text-warning" />
                  </button>
                </Popover>
                <Popover content="Mark as Unread" position="right">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUnreadConfirm(true);
                    }}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg"
                  >
                    <FiCheck className="w-4 h-4 text-destructive" />
                  </button>
                </Popover>
              </>
            )}
          </div>

          {/* Status Badge */}
          {status && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
              {status === 'read' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/90 text-white text-xs font-medium">
                  <FiCheck className="w-3 h-3" />
                  Read
                </span>
              )}
              {status === 'want_to_read' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                  <FiBookmark className="w-3 h-3" />
                  Want to Read
                </span>
              )}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-foreground">
              <FiArrowRight className="w-8 h-8" />
              <span className="text-sm font-medium">Details</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-card-foreground">
            {book.title}
          </h3>
          {book.author_name && book.author_name.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              {book.author_name[0]}
            </p>
          )}
          {book.first_publish_year && (
            <p className="text-sm text-muted-foreground">
              {book.first_publish_year}
            </p>
          )}
        </div>
      </Link>

      {/* Rating Dialog */}
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        title="Rate this book"
        itemTitle={book.title}
        onSubmit={handleRatingSubmit}
      />

      {/* Unread Confirmation */}
      <ConfirmDialog
        isOpen={showUnreadConfirm}
        onClose={() => setShowUnreadConfirm(false)}
        onConfirm={handleUnreadConfirm}
        title="Mark as Unread"
        message="Are you sure you want to mark this book as unread? Your rating and review will be removed."
        confirmText="Mark as Unread"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isUpdating}
      />
    </>
  );
}
