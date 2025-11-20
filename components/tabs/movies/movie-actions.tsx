'use client';

import { useState } from 'react';
import { FiBookmark, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useMovieStatus } from '@/hooks/use-movie-status';
import type { Movie } from '@/lib/tmdb';

interface MovieActionsProps {
  movieId: number;
  movieTitle: string;
  moviePosterPath: string | null;
  movieReleaseDate: string;
}

export default function MovieActions({
  movieId,
  movieTitle,
  moviePosterPath,
  movieReleaseDate,
}: MovieActionsProps) {
  const { status, loading, updateStatus, rewatch } = useMovieStatus(movieId);
  const [isUpdating, setIsUpdating] = useState(false);

  const movie: Movie = {
    id: movieId,
    title: movieTitle,
    poster_path: moviePosterPath,
    backdrop_path: null,
    release_date: movieReleaseDate,
    overview: '',
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
  };

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
    await handleStatusUpdate('watched');
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

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
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
          variant="destructive"
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
            variant="success"
            size="md"
            onClick={handleRemoveFromWatchList}
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
  );
}
