'use client';

import { MovieCard } from './movie-card';
import MovieSearch from './movie-search';
import type { Movie } from '@/lib/tmdb';

interface DiscoverTabProps {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
}

export default function DiscoverTab({
  popularMovies,
  nowPlayingMovies,
}: DiscoverTabProps) {
  return (
    <div>
      <MovieSearch />

      {/* Now Playing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Now Playing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {nowPlayingMovies.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Popular Movies */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Popular Movies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {popularMovies.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
