'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiStar, FiBookmark, FiCheck, FiPlay, FiX } from 'react-icons/fi';
import { TVShow, getImageUrl } from '@/lib/tmdb';
import { useTVShowStatus } from '@/hooks';
import { Popover } from '@/components/ui/popover';

interface TVShowWithStatus extends TVShow {
  status?: 'want_to_watch' | 'watching' | 'completed' | 'stopped_watching';
  watchedEpisodes?: number;
  totalEpisodes?: number;
}

interface TVShowCardListProps {
  tvShow: TVShowWithStatus;
  onStatusChange?: (
    tvShowId: number,
    newStatus:
      | 'want_to_watch'
      | 'watching'
      | 'completed'
      | 'stopped_watching'
      | null
  ) => void;
  showEpisodeCount?: boolean;
}

export function TVShowCardList({
  tvShow,
  onStatusChange,
  showEpisodeCount = false,
}: TVShowCardListProps) {
  const { status, loading, updateStatus } = useTVShowStatus(
    tvShow.id,
    (
      newStatus:
        | 'want_to_watch'
        | 'watching'
        | 'completed'
        | 'stopped_watching'
        | null
    ) => {
      onStatusChange?.(tvShow.id, newStatus);
    }
  );
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
      await updateStatus(newStatus, tvShow);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToWatchList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('want_to_watch');
  };

  const handleMarkAsWatching = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('watching');
  };

  const handleMarkAsStoppedWatching = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('stopped_watching');
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate(null);
  };

  return (
    <Link href={`/tv-shows/${tvShow.id}`} className="block">
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors group cursor-pointer">
        {/* Poster */}
        <div className="relative w-20 shrink-0">
          <div className="relative aspect-2/3 overflow-hidden rounded-md">
            <Image
              src={getImageUrl(tvShow.poster_path, 'w342')}
              alt={tvShow.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              width={342}
              height={513}
              loading="lazy"
              sizes="80px"
            />

            {/* Rating Badge */}
            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
              <div className="flex items-center gap-0.5">
                <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white font-medium">
                  {tvShow.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                {tvShow.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{tvShow.first_air_date?.split('-')[0] || 'N/A'}</span>
                {tvShow.status && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tvShow.status === 'watching'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : tvShow.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : tvShow.status === 'stopped_watching'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : tvShow.status === 'want_to_watch'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {tvShow.status === 'stopped_watching'
                      ? 'Stopped'
                      : tvShow.status === 'want_to_watch'
                      ? 'Want to Watch'
                      : tvShow.status.charAt(0).toUpperCase() +
                        tvShow.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
            {showEpisodeCount && tvShow.totalEpisodes && (
              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-foreground">
                  {tvShow.watchedEpisodes || 0}/{tvShow.totalEpisodes} episodes
                </div>
                <div className="w-20 bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        ((tvShow.watchedEpisodes || 0) / tvShow.totalEpisodes) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div
          className="flex flex-col gap-2 shrink-0"
          onClick={(e) => e.preventDefault()}
        >
          {/* Watch List Button */}
          {!status && (
            <Popover content="Add to Watch List" position="left">
              <button
                onClick={handleAddToWatchList}
                disabled={isUpdating || loading}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
              >
                <FiBookmark className="w-4 h-4" />
              </button>
            </Popover>
          )}

          {status === 'want_to_watch' && (
            <Popover content="Remove from Watch List" position="left">
              <button
                onClick={handleRemove}
                disabled={isUpdating || loading}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
              >
                <FiBookmark className="w-4 h-4 fill-current" />
              </button>
            </Popover>
          )}

          {(status === 'want_to_watch' || !status) && (
            <Popover content="Start Watching" position="left">
              <button
                onClick={handleMarkAsWatching}
                disabled={isUpdating || loading}
                className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
              >
                <FiPlay className="w-4 h-4" />
              </button>
            </Popover>
          )}

          {status === 'watching' && (
            <Popover content="Stop Watching" position="left">
              <button
                onClick={handleMarkAsStoppedWatching}
                disabled={isUpdating || loading}
                className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors shadow-lg disabled:opacity-50"
              >
                <FiX className="w-4 h-4" />
              </button>
            </Popover>
          )}

          {status === 'completed' && (
            <div className="p-2 rounded-full bg-purple-600 text-white shadow-lg">
              <FiCheck className="w-4 h-4" />
            </div>
          )}

          {status === 'stopped_watching' && (
            <div className="flex flex-col gap-1">
              <Popover content="Continue Watching" position="left">
                <button
                  onClick={handleMarkAsWatching}
                  disabled={isUpdating || loading}
                  className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  <FiPlay className="w-4 h-4" />
                </button>
              </Popover>
              <Popover content="Remove" position="left">
                <button
                  onClick={handleRemove}
                  disabled={isUpdating || loading}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
