'use client';

import { useState } from 'react';
import { FiBookmark, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useMovieStatus } from '@/hooks/use-movie-status';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Movie } from '@/lib/tmdb';

interface MovieActionsProps {
  movie: Movie;
}

export default function MovieActions({ movie }: MovieActionsProps) {
  const { status, loading, updateStatus, rewatch } = useMovieStatus(movie.id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showUnwatchConfirm, setShowUnwatchConfirm] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_watch' | 'watched' | null
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, movie);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToWatchList = async () => {
    await handleStatusUpdate('want_to_watch');
  };

  const handleMarkAsWatched = async () => {
    setIsUpdating(true);
    try {
      await updateStatus('watched', movie);
      // Show rating dialog after marking as watched
      setShowRatingDialog(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRewatch = async () => {
    setIsUpdating(true);
    try {
      await rewatch();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromWatchList = async () => {
    await handleStatusUpdate(null);
  };

  const handleUnwatchConfirm = async () => {
    setIsUpdating(true);
    try {
      // Backend will handle review deletion automatically
      await updateStatus(null, movie);
      setShowUnwatchConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    setIsUpdating(true);
    try {
      if (status === 'watched') {
        // Update the already-watched movie with rating/comment
        await updateStatus('watched', movie, rating, comment);
      }
    } finally {
      setIsUpdating(false);
      setShowRatingDialog(false);
    }
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
        movieTitle={movie.title}
        onSubmit={handleRatingSubmit}
      />
      <ConfirmDialog
        isOpen={showUnwatchConfirm}
        onClose={() => setShowUnwatchConfirm(false)}
        onConfirm={handleUnwatchConfirm}
        title="Remove from Watched"
        message="Are you sure you want to mark this movie as unwatched? This will also delete your review if you have one."
        confirmText="Remove & Delete"
        isLoading={isUpdating}
        confirmVariant="destructive"
      />
      <div className="flex flex-wrap gap-3">
        {/* Watch List Button - Don't show when watched */}
        {status !== 'watched' && status !== 'want_to_watch' && (
          <Button
            variant="primary"
            size="md"
            onClick={handleAddToWatchList}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <FiBookmark className="w-5 h-5" />
            <span>{isUpdating ? 'Adding...' : 'Add to Watch List'}</span>
          </Button>
        )}

        {/* Remove from Watch List - Show when in watch list */}
        {status === 'want_to_watch' && (
          <Button
            variant="primary"
            size="md"
            onClick={handleRemoveFromWatchList}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <FiBookmark className="w-5 h-5 fill-current" />
            <span>{isUpdating ? 'Removing...' : 'In Watch List'}</span>
          </Button>
        )}

        {/* Mark as Watched - Show when not watched */}
        {status !== 'watched' && (
          <Button
            variant="success"
            size="md"
            onClick={handleMarkAsWatched}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            <span>{isUpdating ? 'Marking...' : 'Mark as Watched'}</span>
          </Button>
        )}

        {/* Mark as Unwatched & Rewatch - Show when watched */}
        {status === 'watched' && (
          <>
            <Button
              variant="destructive"
              size="md"
              onClick={() => setShowUnwatchConfirm(true)}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              <span>{isUpdating ? 'Updating...' : 'Mark as Unwatched'}</span>
            </Button>

            <Button
              variant="info"
              size="md"
              onClick={handleRewatch}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              <span>{isUpdating ? 'Rewatching...' : 'Rewatch'}</span>
            </Button>
          </>
        )}
      </div>
    </>
  );
}
