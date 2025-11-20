'use client';

import { useState } from 'react';
import { FiFilm, FiMessageSquare } from 'react-icons/fi';
import { Tabs } from '@/components/ui/tabs';
import { MovieCard } from '@/components/tabs/movies/movie-card';
import { MovieComments } from './movie-comments';
import type { Movie } from '@/lib/tmdb';

interface MovieDetailsTabsProps {
  movieId: number;
  movieTitle: string;
  similarMovies: Movie[];
}

export function MovieDetailsTabs({
  movieId,
  movieTitle,
  similarMovies,
}: MovieDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('similar');

  const tabs = [
    {
      id: 'similar',
      label: 'Similar Movies',
      icon: <FiFilm className="w-4 h-4" />,
    },
    {
      id: 'comments',
      label: 'Reviews',
      icon: <FiMessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      <div>
        {activeTab === 'similar' && (
          <div>
            {similarMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {similarMovies.slice(0, 10).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">
                  No similar movies found
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <MovieComments movieId={movieId} movieTitle={movieTitle} />
        )}
      </div>
    </div>
  );
}
