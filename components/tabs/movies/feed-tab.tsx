'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiUser, FiClock } from 'react-icons/fi';
import { getImageUrl } from '@/lib/tmdb';
import { Loading } from '@/components/ui/loading';

interface MovieActivity {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePosterPath: string | null;
  movieReleaseDate: string | null;
  status: 'want_to_watch' | 'watched';
  watchCount: number;
  userRating: number | null;
  userComment: string | null;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullname: string;
    image: string | null;
  };
}

export default function FeedTab() {
  const [activities, setActivities] = useState<MovieActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feed/movies');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching movie feed:', error);
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

  if (loading) {
    return <Loading text="Loading feed..." />;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FiUser className="text-6xl mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No activities yet
        </h3>
        <p className="text-muted-foreground max-w-md">
          Follow other users to see their movie activities here!
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
                  {activity.status === 'watched' && activity.watchCount > 1
                    ? `rewatched (${activity.watchCount}x)`
                    : activity.status === 'watched'
                    ? 'watched'
                    : 'added to watch list'}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Movie Poster */}
                <Link href={`/movies/${activity.movieId}`} className="shrink-0">
                  <div className="relative w-20 aspect-2/3 rounded-md overflow-hidden">
                    <Image
                      src={getImageUrl(activity.moviePosterPath, 'w185')}
                      alt={activity.movieTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/movies/${activity.movieId}`}>
                    <h4 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {activity.movieTitle}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.movieReleaseDate?.split('-')[0] || 'N/A'}
                  </p>

                  {activity.userRating && (
                    <div className="flex items-center gap-1 mb-2">
                      <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-foreground">
                        {activity.userRating}/5
                      </span>
                    </div>
                  )}

                  {activity.userComment && (
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                      &ldquo;{activity.userComment}&rdquo;
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
