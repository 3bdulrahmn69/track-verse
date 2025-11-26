'use client';

import { useState } from 'react';
import { FiBookmark, FiCheck, FiPlay, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useGameStatus } from '@/hooks/use-game-status';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Game } from '@/lib/rawg';
import { toast } from 'react-toastify';

interface GameActionsProps {
  game: Game;
}

export default function GameActions({ game }: GameActionsProps) {
  const { status, loading, updateStatus } = useGameStatus(game.id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleStatusUpdate = async (
    newStatus: 'want_to_play' | 'playing' | 'completed' | null
  ) => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, game);

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

  const handleAddToWantList = async () => {
    await handleStatusUpdate('want_to_play');
  };

  const handleMarkAsPlaying = async () => {
    await handleStatusUpdate('playing');
  };

  const handleMarkAsCompleted = async () => {
    await handleStatusUpdate('completed');
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await updateStatus(null, game);
      setShowRemoveConfirm(false);
      toast.success('Removed from your list');
    } catch {
      toast.error('Failed to remove game');
    } finally {
      setIsUpdating(false);
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
      <div className="flex flex-wrap gap-3">
        {!status && (
          <>
            <Button
              onClick={handleAddToWantList}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiBookmark className="w-4 h-4" />
              Want to Play
            </Button>
            <Button
              onClick={handleMarkAsPlaying}
              disabled={isUpdating}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              Playing
            </Button>
          </>
        )}

        {status === 'want_to_play' && (
          <>
            <Button
              onClick={handleMarkAsPlaying}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              Mark as Playing
            </Button>
            <Button
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isUpdating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Remove
            </Button>
          </>
        )}

        {status === 'playing' && (
          <>
            <Button
              onClick={handleMarkAsCompleted}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-success hover:bg-success/90"
            >
              <FiCheck className="w-4 h-4" />
              Mark as Completed
            </Button>
            <Button
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isUpdating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Remove
            </Button>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-success/20 text-success font-medium">
              <FiCheck className="w-5 h-5" />
              Completed
            </div>
            <Button
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isUpdating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Remove
            </Button>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Game"
        message={`Are you sure you want to remove "${game.name}" from your list?`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
}
