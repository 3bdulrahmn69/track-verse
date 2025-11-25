'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowRight,
  FiStar,
  FiBookmark,
  FiCheck,
  FiRefreshCw,
} from 'react-icons/fi';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { useState } from 'react';
import { useMovieStatus } from '@/hooks/use-movie-status';
import { Popover } from '@/components/ui/popover';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'react-toastify';

interface MovieCardProps {
  movie: Movie;
  onStatusChange?: (
    movieId: number,
    newStatus: 'want_to_watch' | 'watched' | null
  ) => void;
}

export function MovieCard({ movie, onStatusChange }: MovieCardProps) {
  const { status, loading, updateStatus, rewatch } = useMovieStatus(
    movie.id,
    (newStatus) => {
      onStatusChange?.(movie.id, newStatus);
    }
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showUnwatchConfirm, setShowUnwatchConfirm] = useState(false);
  const [rewatchLoading, setRewatchLoading] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_watch' | 'watched' | null,
    rating?: number,
    comment?: string
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, movie, rating, comment);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToWatchList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('want_to_watch');
  };

  const handleMarkAsWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Mark as watched immediately
    await handleStatusUpdate('watched');
    // Then show the rating dialog (optional)
    setShowRatingDialog(true);
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

  const handleRemoveFromWatchList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleRewatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRewatchLoading(true);
    try {
      // Rewatch immediately
      await rewatch();
      toast.success(`Rewatching "${movie.title}"!`);
    } catch (error) {
      toast.error('Failed to mark movie for rewatching');
      console.error('Rewatch error:', error);
    } finally {
      // Keep button disabled for 500ms after completion
      setTimeout(() => {
        setRewatchLoading(false);
      }, 500);
    }
  };

  return (
    <>
      <Link
        href={`/movies/${movie.id}`}
        className="group relative overflow-hidden rounded-lg bg-card shadow-lg hover:shadow-xl transition-all duration-300 block"
      >
        <div className="relative aspect-2/3 overflow-hidden">
          <Image
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="object-cover transition-transform duration-300"
            width={500}
            height={750}
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 bg-background backdrop-blur-sm px-2 py-1 rounded-md">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-warning" />
              <span className="text-foreground text-sm font-semibold">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {/* Watch List Button - Don't show when watched */}
            {status !== 'watched' && status !== 'want_to_watch' && (
              <Popover content="Add to Watch List" position="right">
                <button
                  onClick={handleAddToWatchList}
                  disabled={isUpdating || loading}
                  className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
                >
                  <FiBookmark className="w-4 h-4 text-primary" />
                </button>
              </Popover>
            )}

            {status === 'want_to_watch' && (
              <Popover content="In Watch List" position="right">
                <button
                  onClick={handleRemoveFromWatchList}
                  disabled={isUpdating || loading}
                  className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
                >
                  <FiBookmark className="w-4 h-4 text-primary fill-current" />
                </button>
              </Popover>
            )}

            {/* Watch Button */}
            {status !== 'watched' && (
              <Popover content="Mark as Watched" position="right">
                <button
                  onClick={handleMarkAsWatched}
                  disabled={isUpdating || loading}
                  className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4 text-success" />
                </button>
              </Popover>
            )}

            {status === 'watched' && (
              <>
                <Popover content="Mark as Unwatched" position="right">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUnwatchConfirm(true);
                    }}
                    disabled={isUpdating || loading}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4 text-destructive" />
                  </button>
                </Popover>
                <Popover content="Rewatch" position="right">
                  <button
                    onClick={handleRewatch}
                    disabled={isUpdating || loading || rewatchLoading}
                    className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 text-info ${
                        rewatchLoading ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </Popover>
              </>
            )}
          </div>

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
            {movie.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 'TBA'}
          </p>
          <p className="text-sm text-foreground line-clamp-2">
            {movie.overview}
          </p>
        </div>
      </Link>

      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => {
          setShowRatingDialog(false);
        }}
        title="Rate this movie"
        itemTitle={movie.title}
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
    </>
  );
}
