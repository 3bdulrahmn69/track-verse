'use client';

import { useState, useEffect } from 'react';
import { FiUserPlus, FiUserCheck, FiClock } from 'react-icons/fi';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

export function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState<{
    isFollowing: boolean;
    followRequestSent: boolean;
    isFollower: boolean;
    hasFollowRequest: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follow?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFollowStatus(data);
        }
      } catch (error) {
        console.error('Error fetching follow status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowStatus();
  }, [userId]);

  const refetchStatus = async () => {
    try {
      const response = await fetch(`/api/follow?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFollowStatus(data);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollow = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await refetchStatus();
        onFollowChange?.();
      } else {
        const data = await response.json();
        console.error(data.error || 'Failed to send follow request');
      }
    } catch (error) {
      console.error('Error sending follow request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnfollow = () => {
    setShowUnfollowDialog(true);
  };

  const confirmUnfollow = async () => {
    setShowUnfollowDialog(false);
    setProcessing(true);
    try {
      const response = await fetch(`/api/follow?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refetchStatus();
        onFollowChange?.();
      } else {
        console.error('Failed to unfollow');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (!followStatus) return null;

  if (followStatus.isFollowing) {
    return (
      <>
        <button
          onClick={handleUnfollow}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FiUserCheck className="w-4 h-4" />
          Following
        </button>
        <ConfirmDialog
          isOpen={showUnfollowDialog}
          onClose={() => setShowUnfollowDialog(false)}
          onConfirm={confirmUnfollow}
          title="Unfollow User"
          message="Are you sure you want to unfollow this user? You will no longer see their activity in your feed."
          confirmText="Unfollow"
          cancelText="Cancel"
          confirmVariant="destructive"
          isLoading={processing}
        />
      </>
    );
  }

  if (followStatus.followRequestSent) {
    return (
      <>
        <button
          onClick={handleUnfollow}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          <FiClock className="w-4 h-4" />
          Request Sent
        </button>
        <ConfirmDialog
          isOpen={showUnfollowDialog}
          onClose={() => setShowUnfollowDialog(false)}
          onConfirm={confirmUnfollow}
          title="Cancel Follow Request"
          message="Are you sure you want to cancel your follow request?"
          confirmText="Cancel Request"
          cancelText="Keep Request"
          confirmVariant="destructive"
          isLoading={processing}
        />
      </>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={processing}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      <FiUserPlus className="w-4 h-4" />
      Follow
    </button>
  );
}
