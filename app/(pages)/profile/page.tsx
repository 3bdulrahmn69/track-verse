import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { userMovies, userTvShows, userEpisodes } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { MovieCard } from '@/components/tabs/movies/movie-card';
import { TVShowCard } from '@/components/tabs/tv-shows/tv-show-card';
import { FiUser, FiFilm, FiClock, FiEdit2, FiTv } from 'react-icons/fi';
import Link from 'next/link';
import BackButton from '@/components/shared/back-button';
import { Avatar } from '@/components/ui/avatar';
import { UserStats } from '@/components/user/user-stats';
import type { Movie } from '@/lib/tmdb';
import type { TVShow } from '@/lib/tmdb';
import {
  formatWatchTime,
  calculateTotalMovieWatchCount,
  calculateMovieWatchHours,
  calculateEpisodeWatchHours,
} from '@/lib/utils';

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

  // Fetch user's completed TV shows
  const completedTVShows = await db
    .select()
    .from(userTvShows)
    .where(
      and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.status, 'completed')
      )
    );

  // Fetch all user's TV shows
  const allUserTVShows = await db
    .select()
    .from(userTvShows)
    .where(
      and(
        eq(userTvShows.userId, session.user.id),
        ne(userTvShows.status, 'want_to_watch')
      )
    );

  // Get watched episodes count
  const watchedEpisodes = await db
    .select()
    .from(userEpisodes)
    .where(
      and(
        eq(userEpisodes.userId, session.user.id),
        eq(userEpisodes.watched, true)
      )
    );

  // Transform movies to Movie objects
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
    runtime: record.runtime || 0,
  }));

  // Transform TV shows to TVShow objects
  const tvShows: TVShow[] = allUserTVShows.map((record) => ({
    id: record.tvShowId,
    name: record.tvShowName,
    poster_path: record.tvShowPosterPath,
    backdrop_path: null,
    first_air_date: record.tvShowFirstAirDate || '',
    overview: '',
    vote_average: record.tmdbRating || 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    origin_country: [],
    original_language: '',
    original_name: record.tvShowName,
  }));

  // Calculate statistics
  const totalMovieWatchCount = calculateTotalMovieWatchCount(watchedMovies);

  // Calculate actual movie watch time from DB (runtime in minutes * watchCount)
  const movieWatchHours = calculateMovieWatchHours(watchedMovies);

  // Calculate actual episode watch time from DB (runtime in minutes for watched episodes)
  const episodeWatchHours = calculateEpisodeWatchHours(watchedEpisodes);

  const totalWatchHours = movieWatchHours + episodeWatchHours;

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

          {/* Stats Cards */}
          <UserStats
            variant="detailed"
            stats={[
              {
                label: 'Movies',
                description: 'Watch History',
                icon: <FiFilm className="w-8 h-8 text-primary" />,
                bgColor: 'from-primary/20 to-primary/5',
                value: {
                  primary: 'Movies Watched',
                  primaryValue: movies.length,
                  secondary: 'Total Views',
                  secondaryValue: totalMovieWatchCount,
                  tertiary: 'Watch Time',
                  tertiaryValue: formatWatchTime(movieWatchHours),
                },
              },
              {
                label: 'TV Shows',
                description: 'Episode Tracker',
                icon: <FiTv className="w-8 h-8 text-secondary" />,
                bgColor: 'from-secondary/20 to-secondary/5',
                textColor: 'text-secondary',
                value: {
                  primary: 'Shows Completed',
                  primaryValue: completedTVShows.length,
                  secondary: 'Episodes Watched',
                  secondaryValue: watchedEpisodes.length,
                  tertiary: 'Watch Time',
                  tertiaryValue: formatWatchTime(episodeWatchHours),
                },
              },
            ]}
            className="mt-8"
          />

          {/* Total Watch Time Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiClock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Watch Time
              </span>
            </div>
            <p className="text-center text-2xl font-bold text-foreground">
              {formatWatchTime(totalWatchHours)}
            </p>
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

        {/* TV Shows */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">TV Shows</h2>

          {tvShows.length === 0 ? (
            <div className="text-center py-16">
              <FiTv className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No TV Shows Added Yet
              </h3>
              <p className="text-muted-foreground">
                Add TV shows to your watchlist and they&apos;ll appear here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tvShows.map((tvShow) => (
                <TVShowCard key={tvShow.id} tvShow={tvShow} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
