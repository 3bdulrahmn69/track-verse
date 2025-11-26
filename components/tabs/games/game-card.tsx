'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowRight,
  FiStar,
  FiBookmark,
  FiCheck,
  FiPlay,
} from 'react-icons/fi';
import { Game, getGameImageUrl } from '@/lib/rawg';
import { useState } from 'react';
import { useGameStatus } from '@/hooks/use-game-status';
import { Popover } from '@/components/ui/popover';
import { toast } from 'react-toastify';

interface GameCardProps {
  game: Game;
  onStatusChange?: (
    gameId: number,
    newStatus: 'want_to_play' | 'playing' | 'completed' | null
  ) => void;
}

export function GameCard({ game, onStatusChange }: GameCardProps) {
  const { status, loading, updateStatus } = useGameStatus(
    game.id,
    (newStatus) => {
      onStatusChange?.(game.id, newStatus);
    }
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_play' | 'playing' | 'completed' | null,
    rating?: number
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(
        newStatus,
        game,
        rating !== undefined ? rating : null,
        game.playtime || null
      );

      // Show toast notification
      if (newStatus === null) {
        toast.success('Removed from your list');
      } else if (newStatus === 'want_to_play') {
        toast.success('Added to Want to Play');
      } else if (newStatus === 'playing') {
        toast.success('Marked as Playing');
      } else if (newStatus === 'completed') {
        toast.success('Marked as Completed');
      }
    } catch {
      toast.error('Failed to update game status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToWantList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('want_to_play', Number(game.rating));
  };

  const handleMarkAsPlaying = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('playing');
  };

  const handleMarkAsCompleted = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate('completed');
  };

  const handleRemoveFromList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleStatusUpdate(null);
  };

  const getStatusButton = () => {
    if (loading || isUpdating) {
      return (
        <button
          disabled
          aria-label="Loading"
          className="p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50"
        >
          <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </button>
      );
    }

    const buttonClass =
      'p-2 rounded-full bg-background hover:bg-background/80 transition-colors shadow-lg disabled:opacity-50';
    const disabled = isUpdating || loading;

    return (
      <>
        {/* Want to Play Button */}
        {!status && (
          <Popover content="Add to Want to Play" position="right">
            <button
              onClick={handleAddToWantList}
              disabled={disabled}
              className={buttonClass}
              aria-label="Add to Want to Play"
            >
              <FiBookmark className="w-4 h-4 text-primary" />
            </button>
          </Popover>
        )}

        {/* In Want to Play List */}
        {status === 'want_to_play' && (
          <Popover content="In Want to Play List" position="right">
            <button
              onClick={handleRemoveFromList}
              disabled={disabled}
              className={buttonClass}
              aria-label="Remove from Want to Play"
            >
              <FiBookmark className="w-4 h-4 text-primary fill-current" />
            </button>
          </Popover>
        )}

        {/* Mark as Playing Button */}
        {status !== 'playing' && status !== 'completed' && (
          <Popover content="Mark as Playing" position="right">
            <button
              onClick={handleMarkAsPlaying}
              disabled={disabled}
              className={buttonClass}
              aria-label="Mark as Playing"
            >
              <FiPlay className="w-4 h-4 text-info" />
            </button>
          </Popover>
        )}

        {/* Currently Playing */}
        {status === 'playing' && (
          <Popover content="Currently Playing" position="right">
            <button
              onClick={handleRemoveFromList}
              disabled={disabled}
              className={buttonClass}
              aria-label="Remove from Playing"
            >
              <FiPlay className="w-4 h-4 text-info fill-current" />
            </button>
          </Popover>
        )}

        {/* Mark as Completed Button */}
        {status === 'playing' && (
          <Popover content="Mark as Completed" position="right">
            <button
              onClick={handleMarkAsCompleted}
              disabled={disabled}
              className={buttonClass}
              aria-label="Mark as Completed"
            >
              <FiCheck className="w-4 h-4 text-success" />
            </button>
          </Popover>
        )}

        {/* Completed */}
        {status === 'completed' && (
          <Popover content="Completed" position="right">
            <button
              onClick={handleRemoveFromList}
              disabled={disabled}
              className={buttonClass}
              aria-label="Remove from Completed"
            >
              <FiCheck className="w-4 h-4 text-success fill-current" />
            </button>
          </Popover>
        )}
      </>
    );
  };

  return (
    <Link href={`/games/${game.id}`}>
      <div className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={getGameImageUrl(game.background_image)}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Rating Badge */}
          {Number(game.rating) > 0 && (
            <div className="absolute top-2 right-2 bg-background backdrop-blur-sm px-2 py-1 rounded-md">
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-warning" />
                <span className="text-foreground text-sm font-semibold">
                  {Number(game.rating).toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons - Show on hover */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {getStatusButton()}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-foreground">
              <FiArrowRight className="w-8 h-8" />
              <span className="text-sm font-medium">Details</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {game.name}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {game.released && (
              <span>{new Date(game.released).getFullYear()}</span>
            )}
            {game.metacritic && (
              <div className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                {game.metacritic}
              </div>
            )}
          </div>

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {game.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
