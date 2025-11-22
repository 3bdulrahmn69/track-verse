'use client';

import { useState } from 'react';
import { FiBookmark, FiPlay, FiCheck, FiX } from 'react-icons/fi';
import { useTVShowStatus } from '@/hooks';

interface TVShowActionsProps {
  tvShowId: number;
  tvShowName: string;
  tvShowPosterPath: string | null;
  tvShowFirstAirDate: string;
}

export default function TVShowActions({
  tvShowId,
  tvShowName,
  tvShowPosterPath,
  tvShowFirstAirDate,
}: TVShowActionsProps) {
  const { status, loading, updateStatus } = useTVShowStatus(tvShowId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (
    newStatus:
      | 'want_to_watch'
      | 'watching'
      | 'completed'
      | 'stopped_watching'
      | null
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, {
        id: tvShowId,
        name: tvShowName,
        poster_path: tvShowPosterPath,
        first_air_date: tvShowFirstAirDate,
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        origin_country: [],
        original_language: '',
        original_name: tvShowName,
        overview: '',
        backdrop_path: null,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {!status && (
        <>
          <button
            onClick={() => handleStatusUpdate('want_to_watch')}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            <FiBookmark className="w-5 h-5" />
            Add to Watch List
          </button>
          <button
            onClick={() => handleStatusUpdate('watching')}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            <FiPlay className="w-5 h-5" />
            Start Watching
          </button>
        </>
      )}

      {status === 'want_to_watch' && (
        <>
          <button
            onClick={() => handleStatusUpdate('watching')}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            <FiPlay className="w-5 h-5" />
            Start Watching
          </button>
          <button
            onClick={() => handleStatusUpdate(null)}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 font-medium"
          >
            <FiX className="w-5 h-5" />
            Remove from List
          </button>
        </>
      )}

      {status === 'watching' && (
        <button
          onClick={() => handleStatusUpdate('stopped_watching')}
          disabled={loading || isUpdating}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 font-medium"
        >
          <FiX className="w-5 h-5" />
          Stop Watching
        </button>
      )}

      {status === 'completed' && (
        <button
          onClick={() => handleStatusUpdate(null)}
          disabled={loading || isUpdating}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
        >
          <FiCheck className="w-5 h-5" />
          Completed • Remove
        </button>
      )}

      {status === 'stopped_watching' && (
        <>
          <button
            onClick={() => handleStatusUpdate('watching')}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            <FiPlay className="w-5 h-5" />
            Continue Watching
          </button>
          <button
            onClick={() => handleStatusUpdate(null)}
            disabled={loading || isUpdating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 font-medium"
          >
            <FiX className="w-5 h-5" />
            Stopped Watching • Remove
          </button>
        </>
      )}
    </div>
  );
}
