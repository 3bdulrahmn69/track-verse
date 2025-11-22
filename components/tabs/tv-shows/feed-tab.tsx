'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiClock } from 'react-icons/fi';
import { getImageUrl } from '@/lib/tmdb';

interface TVShowActivity {
  id: string;
  tvShowId: number;
  tvShowName: string;
  tvShowPosterPath: string | null;
  tvShowFirstAirDate: string | null;
  status: 'want_to_watch' | 'watching' | 'completed' | 'stopped_watching';
  totalSeasons: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  updatedAt: string;
  userId: string;
  username: string;
  fullname: string;
  userImage: string | null;
}

export default function TVShowFeedTab() {
  const [activities, setActivities] = useState<TVShowActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feed/tv-shows');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching TV show feed:', error);
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

  const getStatusText = (
    status: string,
    watchedEpisodes: number,
    totalEpisodes: number
  ) => {
    switch (status) {
      case 'watching':
        return `is watching (${watchedEpisodes}/${totalEpisodes} episodes)`;
      case 'completed':
        return 'completed';
      case 'stopped_watching':
        return 'stopped watching';
      case 'want_to_watch':
        return 'added to watch list';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return 'text-blue-600 dark:text-blue-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'stopped_watching':
        return 'text-red-600 dark:text-red-400';
      case 'want_to_watch':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FiUser className="text-6xl mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No activities yet
        </h3>
        <p className="text-muted-foreground max-w-md">
          Follow other users to see their TV show activities here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Activity Feed</h2>
        <p className="text-muted-foreground mt-1">
          See what your friends are watching
        </p>
      </div>

      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
        >
          <div className="flex gap-4">
            {/* User Info */}
            <Link href={`/users/${activity.username}`} className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {activity.userImage ? (
                  <Image
                    src={activity.userImage}
                    alt={activity.fullname}
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
                  href={`/users/${activity.username}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {activity.fullname}
                </Link>
                <span className={`ml-1 ${getStatusColor(activity.status)}`}>
                  {getStatusText(
                    activity.status,
                    activity.watchedEpisodes,
                    activity.totalEpisodes
                  )}
                </span>
              </div>

              <div className="flex gap-4">
                {/* TV Show Poster */}
                <Link
                  href={`/tv-shows/${activity.tvShowId}`}
                  className="shrink-0"
                >
                  <div className="relative w-20 aspect-2/3 rounded-md overflow-hidden">
                    <Image
                      src={getImageUrl(activity.tvShowPosterPath, 'w185')}
                      alt={activity.tvShowName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* TV Show Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/tv-shows/${activity.tvShowId}`}>
                    <h4 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {activity.tvShowName}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.tvShowFirstAirDate?.split('-')[0] || 'N/A'}
                  </p>

                  {activity.status === 'watching' &&
                    activity.totalEpisodes > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <span className="text-foreground font-medium">
                            Progress:{' '}
                            {Math.round(
                              (activity.watchedEpisodes /
                                activity.totalEpisodes) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (activity.watchedEpisodes /
                                  activity.totalEpisodes) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {activity.totalSeasons > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {activity.totalSeasons} season
                      {activity.totalSeasons !== 1 ? 's' : ''} •{' '}
                      {activity.totalEpisodes} episode
                      {activity.totalEpisodes !== 1 ? 's' : ''}
                    </p>
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
