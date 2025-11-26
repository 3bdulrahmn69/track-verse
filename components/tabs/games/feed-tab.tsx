'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiClock } from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import { Loading } from '@/components/ui/loading';

interface GameActivity {
  id: string;
  gameId: number;
  gameName: string;
  gameSlug: string;
  gameBackgroundImage: string;
  gameReleased: string;
  metacritic: number | null;
  playtime: number;
  status: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullname: string;
    image: string | null;
  };
}

export default function FeedTab() {
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games/feed');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.games || []);
        }
      } catch (error) {
        console.error('Error fetching games feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'playing':
        return 'is playing';
      case 'want_to_play':
        return 'wants to play';
      default:
        return status.replace('_', ' ');
    }
  };

  if (loading) {
    return <Loading text="Loading feed..." />;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <IoGameController className="text-6xl mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No activities yet
        </h3>
        <p className="text-muted-foreground max-w-md">
          Follow other users to see their gaming activities here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Activity Feed</h2>
        <p className="text-muted-foreground mt-1">
          See what your friends are playing
        </p>
      </div>

      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
        >
          <div className="flex gap-4">
            {/* User Info */}
            <Link
              href={`/users/${activity.user.username}`}
              className="shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {activity.user.image ? (
                  <Image
                    src={activity.user.image}
                    alt={activity.user.fullname}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <FiUser className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </Link>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <Link
                  href={`/users/${activity.user.username}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {activity.user.fullname}
                </Link>
                <span className="text-muted-foreground ml-1">
                  {getStatusText(activity.status)}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Game Image */}
                <Link href={`/games/${activity.gameId}`} className="shrink-0">
                  <div className="relative w-20 h-28 rounded-md overflow-hidden">
                    <Image
                      src={
                        activity.gameBackgroundImage || '/placeholder-game.jpg'
                      }
                      alt={activity.gameName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/games/${activity.gameId}`}>
                    <h4 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {activity.gameName}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.gameReleased?.split('-')[0] || 'N/A'}
                  </p>

                  {activity.metacritic && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                        {activity.metacritic}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Metacritic
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {formatDate(activity.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
