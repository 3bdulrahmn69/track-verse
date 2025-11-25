'use client';

import { useState } from 'react';
import { FiBookmark, FiCheck, FiStar } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useBookStatus } from '@/hooks/use-book-status';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Book } from '@/lib/books';

interface BookActionsProps {
  book: Book;
}

export default function BookActions({ book }: BookActionsProps) {
  const { status, loading, updateStatus } = useBookStatus(book.key);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showUnReadConfirm, setShowUnReadConfirm] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_read' | 'read' | null
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, book);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToReadList = async () => {
    await handleStatusUpdate('want_to_read');
  };

  const handleMarkAsRead = async () => {
    setIsUpdating(true);
    try {
      await updateStatus('read', book);
      // Show rating dialog after marking as read
      setShowRatingDialog(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromReadList = async () => {
    setIsUpdating(true);
    try {
      await updateStatus(null, book);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmMarkAsUnread = async () => {
    setShowUnReadConfirm(false);
    setIsUpdating(true);
    try {
      await updateStatus(null, book);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    await updateStatus('read', book, rating, comment);
    setShowRatingDialog(false);
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        title="Rate this book"
        itemTitle={book.title}
        onSubmit={handleRatingSubmit}
        initialRating={0}
        initialComment=""
      />

      <ConfirmDialog
        isOpen={showUnReadConfirm}
        onClose={() => setShowUnReadConfirm(false)}
        onConfirm={confirmMarkAsUnread}
        title="Mark as Unread"
        message="Are you sure you want to mark this book as unread? Your rating and review will be removed."
        confirmText="Mark as Unread"
        confirmVariant="destructive"
      />

      <div className="flex flex-wrap gap-3">
        {/* Show Add to Read List and Mark as Read when no status */}
        {status === null && (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddToReadList}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiBookmark className="w-5 h-5" />
              <span>{isUpdating ? 'Adding...' : 'Add to Read List'}</span>
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={handleMarkAsRead}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              <span>{isUpdating ? 'Marking...' : 'Mark as Read'}</span>
            </Button>
          </>
        )}

        {/* Show In Read List and Mark as Read when in read list */}
        {status === 'want_to_read' && (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={handleRemoveFromReadList}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiBookmark className="w-5 h-5 fill-current" />
              <span>{isUpdating ? 'Removing...' : 'In Read List'}</span>
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={handleMarkAsRead}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              <span>{isUpdating ? 'Marking...' : 'Mark as Read'}</span>
            </Button>
          </>
        )}

        {/* Show Rate & Review and Mark as Unread when read */}
        {status === 'read' && (
          <>
            <Button
              variant="destructive"
              size="md"
              onClick={() => setShowUnReadConfirm(true)}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              <span>{isUpdating ? 'Updating...' : 'Mark as Unread'}</span>
            </Button>
          </>
        )}
      </div>
    </>
  );
}
