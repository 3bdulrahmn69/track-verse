import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { userMovies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { MovieCard } from '@/components/tabs/movies/movie-card';
import { FiUser, FiFilm, FiClock, FiEdit2 } from 'react-icons/fi';
import Link from 'next/link';
import BackButton from '@/components/shared/back-button';
import { Avatar } from '@/components/ui/avatar';
import type { Movie } from '@/lib/tmdb';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's watched movies
  const watchedMovies = await db
    .select()
    .from(userMovies)
    .where(
      and(
        eq(userMovies.userId, session.user.id),
        eq(userMovies.status, 'watched')
      )
    );

  // Transform to Movie objects
  const movies: Movie[] = watchedMovies.map((record) => ({
    id: record.movieId,
    title: record.movieTitle,
    poster_path: record.moviePosterPath,
    backdrop_path: null,
    release_date: record.movieReleaseDate || '',
    overview: '',
    vote_average: record.tmdbRating || 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
  }));

  // Calculate total watch count
  const totalWatchCount = watchedMovies.reduce(
    (sum, movie) => sum + (movie.watchCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar
              src={session.user.image}
              alt={session.user.name || 'User'}
              size="xl"
            />

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-foreground">
                  {session.user.name}
                </h1>
                <Link
                  href="/settings"
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="Edit profile"
                >
                  <FiEdit2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <FiUser className="w-5 h-5" />
                  <span>@{session.user.username}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiFilm className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {movies.length}
              </p>
              <p className="text-sm text-muted-foreground">Movies Watched</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiClock className="w-6 h-6 text-success" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {totalWatchCount}
              </p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>

            <div className="text-center col-span-2 md:col-span-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiFilm className="w-6 h-6 text-info" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {totalWatchCount > 0
                  ? (totalWatchCount / movies.length).toFixed(1)
                  : '0'}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Rewatches</p>
            </div>
          </div>
        </div>

        {/* Watched Movies */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Watched Movies
          </h2>

          {movies.length === 0 ? (
            <div className="text-center py-16">
              <FiFilm className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Movies Watched Yet
              </h3>
              <p className="text-muted-foreground">
                Start watching movies and they&apos;ll appear here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
