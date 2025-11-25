'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Tabs } from '@/components/ui/tabs';
import { Popover } from '@/components/ui/popover';
import { FiUser, FiUserMinus, FiUserX } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'followers' | 'following';
  isOwnProfile?: boolean;
}

export function FollowersDialog({
  isOpen,
  onClose,
  userId,
  initialTab = 'followers',
  isOwnProfile = false,
}: FollowersDialogProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`/api/follow/${userId}/followers`),
        fetch(`/api/follow/${userId}/following`),
      ]);

      if (!followersRes.ok || !followingRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [followersData, followingData] = await Promise.all([
        followersRes.json(),
        followingRes.json(),
      ]);

      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      setError('Failed to load followers/following data');
      console.error('Error fetching followers/following:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleUnfollow = async (
    targetUserId: string,
    targetUsername: string
  ) => {
    setProcessingUserId(targetUserId);
    try {
      const response = await fetch(`/api/follow?userId=${targetUserId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from following list
        setFollowing((prev) => prev.filter((user) => user.id !== targetUserId));
        toast.success(`Unfollowed ${targetUsername}`);
      } else {
        toast.error('Failed to unfollow user');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRemoveFollower = async (
    followerUserId: string,
    followerUsername: string
  ) => {
    setProcessingUserId(followerUserId);
    try {
      const response = await fetch(`/api/follow/${followerUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        // Remove from followers list
        setFollowers((prev) =>
          prev.filter((user) => user.id !== followerUserId)
        );
        toast.success(`Removed ${followerUsername} from followers`);
      } else {
        toast.error('Failed to remove follower');
      }
    } catch (error) {
      console.error('Error removing follower:', error);
      toast.error('Failed to remove follower');
    } finally {
      setProcessingUserId(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchData();
    }
  }, [isOpen, initialTab, fetchData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'followers' | 'following');
  };

  const tabData = [
    {
      id: 'followers',
      label: `Followers (${followers.length})`,
    },
    {
      id: 'following',
      label: `Following (${following.length})`,
    },
  ];

  const currentUsers = activeTab === 'followers' ? followers : following;
  const currentTitle = activeTab === 'followers' ? 'Followers' : 'Following';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={currentTitle}
      className="sm:max-w-md"
    >
      {/* Tabs */}
      <Tabs
        tabs={tabData}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="mb-4"
      />

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive text-sm">{error}</div>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FiUser className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No {currentTitle.toLowerCase()} yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              >
                <Link
                  href={`/users/${user.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Avatar
                    src={user.image}
                    alt={user.name || user.username}
                    size="sm"
                    className="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
                {activeTab === 'following' && (
                  <Popover content="Unfollow" position="left">
                    <button
                      onClick={() =>
                        handleUnfollow(user.id, user.name || user.username)
                      }
                      disabled={processingUserId === user.id}
                      className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                    >
                      <FiUserMinus className="w-4 h-4" />
                    </button>
                  </Popover>
                )}
                {activeTab === 'followers' && isOwnProfile && (
                  <Popover content="Remove follower" position="left">
                    <button
                      onClick={() =>
                        handleRemoveFollower(
                          user.id,
                          user.name || user.username
                        )
                      }
                      disabled={processingUserId === user.id}
                      className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                    >
                      <FiUserX className="w-4 h-4" />
                    </button>
                  </Popover>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
