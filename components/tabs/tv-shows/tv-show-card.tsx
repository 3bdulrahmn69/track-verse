'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowRight,
  FiStar,
  FiBookmark,
  FiCheck,
  FiPlay,
  FiX,
} from 'react-icons/fi';
import { TVShow, getImageUrl } from '@/lib/tmdb';
import { useState, useEffect } from 'react';
import { useTVShowStatus } from '@/hooks';
import { Popover } from '@/components/ui/popover';

interface TVShowCardProps {
  tvShow: TVShow;
  onStatusChange?: (
    tvShowId: number,
    newStatus: 'want_to_watch' | 'watching' | 'completed' | 'dropped' | null
  ) => void;
}

export function TVShowCard({ tvShow, onStatusChange }: TVShowCardProps) {
  const { status, watchedEpisodes, totalEpisodes, loading, updateStatus } =
    useTVShowStatus(
      tvShow.id,
      (
        newStatus:
          | 'want_to_watch'
          | 'watching'
          | 'completed'
          | 'dropped'
          | null,
        watchedEps?: number,
        totalEps?: number
      ) => {
        onStatusChange?.(tvShow.id, newStatus);
      }
    );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_watch' | 'watching' | 'completed' | 'dropped' | null
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

  const handleMarkAsCompleted = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('completed');
  };

  const handleMarkAsDropped = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('dropped');
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate(null);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg bg-card shadow-lg hover:shadow-xl transition-all duration-300">
        <Link href={`/tv-shows/${tvShow.id}`} className="block">
          <div className="relative aspect-2/3 overflow-hidden">
            <Image
              src={getImageUrl(tvShow.poster_path, 'w500')}
              alt={tvShow.name}
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
                  {tvShow.vote_average.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {/* Watch List Button */}
              {!status && (
                <Popover content="Add to Watch List" position="right">
                  <button
                    onClick={handleAddToWatchList}
                    disabled={isUpdating || loading}
                    className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary transition-colors shadow-lg disabled:opacity-50"
                  >
                    <FiBookmark className="w-4 h-4" />
                  </button>
                </Popover>
              )}

              {status === 'want_to_watch' && (
                <>
                  <Popover content="In Watch List" position="right">
                    <button
                      onClick={handleRemove}
                      disabled={isUpdating || loading}
                      className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FiBookmark className="w-4 h-4 fill-current" />
                    </button>
                  </Popover>
                  <Popover content="Start Watching" position="right">
                    <button
                      onClick={handleMarkAsWatching}
                      disabled={isUpdating || loading}
                      className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FiPlay className="w-4 h-4" />
                    </button>
                  </Popover>
                </>
              )}

              {status === 'watching' && (
                <>
                  <Popover content="Watching" position="right">
                    <button
                      disabled
                      className="p-2 rounded-full bg-green-600 text-white transition-colors shadow-lg opacity-90"
                    >
                      <FiPlay className="w-4 h-4" />
                    </button>
                  </Popover>
                  <Popover content="Mark as Completed" position="right">
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={isUpdating || loading}
                      className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  </Popover>
                  <Popover content="Drop Show" position="right">
                    <button
                      onClick={handleMarkAsDropped}
                      disabled={isUpdating || loading}
                      className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </Popover>
                </>
              )}

              {status === 'completed' && (
                <Popover content="Completed" position="right">
                  <button
                    onClick={handleRemove}
                    disabled={isUpdating || loading}
                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                </Popover>
              )}

              {status === 'dropped' && (
                <Popover content="Dropped" position="right">
                  <button
                    onClick={handleRemove}
                    disabled={isUpdating || loading}
                    className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </Popover>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white">
                <FiArrowRight className="w-8 h-8" />
                <span className="text-sm font-medium">Details</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-card-foreground">
              {tvShow.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {tvShow.first_air_date
                ? new Date(tvShow.first_air_date).getFullYear()
                : 'TBA'}
            </p>
            <p className="text-sm text-foreground line-clamp-2">
              {tvShow.overview}
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
