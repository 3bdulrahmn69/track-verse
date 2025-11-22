'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Tabs } from '@/components/ui/tabs';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';

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
}

export function FollowersDialog({
  isOpen,
  onClose,
  userId,
  initialTab = 'followers',
}: FollowersDialogProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
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
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
