'use client';

import { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { FollowButton } from '@/components/user/follow-button';
import { FollowersDialog } from '@/components/user/followers-dialog';

interface UserFollowInfoProps {
  userId: string;
  currentUserId?: string;
  showFollowButton?: boolean;
}

export function UserFollowInfo({
  userId,
  currentUserId,
  showFollowButton = true,
}: UserFollowInfoProps) {
  const [stats, setStats] = useState<{
    followerCount: number;
    followingCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'followers' | 'following'>(
    'followers'
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/follow/stats/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching follow stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const refetchStats = async () => {
    try {
      const response = await fetch(`/api/follow/stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  // Don't show follow button if viewing own profile
  const shouldShowFollowButton =
    showFollowButton && currentUserId && currentUserId !== userId;

  const handleFollowersClick = () => {
    setDialogTab('followers');
    setDialogOpen(true);
  };

  const handleFollowingClick = () => {
    setDialogTab('following');
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Follower/Following Stats */}
      <div className="flex items-center gap-6 text-sm">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FiUsers className="w-4 h-4" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <button
              onClick={handleFollowersClick}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <span className="font-semibold text-foreground">
                {stats?.followerCount || 0}
              </span>
              <span className="text-muted-foreground hover:text-foreground">
                {stats?.followerCount === 1 ? 'Follower' : 'Followers'}
              </span>
            </button>
            <button
              onClick={handleFollowingClick}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <span className="font-semibold text-foreground">
                {stats?.followingCount || 0}
              </span>
              <span className="text-muted-foreground hover:text-foreground">
                Following
              </span>
            </button>
          </>
        )}
      </div>

      {/* Follow Button */}
      {shouldShowFollowButton && (
        <FollowButton userId={userId} onFollowChange={refetchStats} />
      )}

      {/* Followers Dialog */}
      <FollowersDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
        initialTab={dialogTab}
      />
    </div>
  );
}
