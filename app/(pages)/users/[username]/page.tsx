import { notFound } from 'next/navigation';
import {
  FiCalendar,
  FiFilm,
  FiStar,
  FiClock,
  FiTv,
  FiBookOpen,
} from 'react-icons/fi';
import { db } from '@/lib/db';
import {
  users,
  userMovies,
  userTvShows,
  userEpisodes,
  userFollows,
  userBooks,
  reviews,
} from '@/lib/db/schema';
import { eq, and, isNotNull, ne } from 'drizzle-orm';
import { MediaCarousel } from '@/components/ui/media-carousel';
import BackButton from '@/components/shared/back-button';
import { Avatar } from '@/components/ui/avatar';
import { UserStats } from '@/components/user/user-stats';
import { UserFollowInfo } from '@/components/user/user-follow-info';
import { auth } from '@/lib/auth-config';
import type { Movie } from '@/lib/tmdb';
import type { TVShow } from '@/lib/tmdb';
import type { Book } from '@/lib/books';
import {
  formatWatchTime,
  calculateTotalMovieWatchCount,
  calculateMovieWatchHours,
  calculateEpisodeWatchHours,
} from '@/lib/utils';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  // Get current user session
  const session = await auth();

  // Fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    notFound();
  }

  // Check if current user is following this user with accepted status
  let canViewPrivateContent = user.isPublic;
  if (session?.user && session.user.id !== user.id) {
    const [followRelationship] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.followingId, user.id),
          eq(userFollows.status, 'accepted')
        )
      )
      .limit(1);

    canViewPrivateContent = user.isPublic || !!followRelationship;
  }

  // Fetch user's watched movies
  const watchedMovies = await db
    .select()
    .from(userMovies)
    .where(
      and(eq(userMovies.userId, user.id), eq(userMovies.status, 'watched'))
    )
    .orderBy(userMovies.updatedAt);

  // Fetch user's TV shows except want_to_watch
  const allTVShows = await db
    .select()
    .from(userTvShows)
    .where(
      and(
        eq(userTvShows.userId, user.id),
        ne(userTvShows.status, 'want_to_watch')
      )
    );

  // Fetch user's read books
  const readBooks = await db
    .select()
    .from(userBooks)
    .where(and(eq(userBooks.userId, user.id), eq(userBooks.status, 'read')));

  // Get watched episodes count
  const watchedEpisodes = await db
    .select()
    .from(userEpisodes)
    .where(
      and(eq(userEpisodes.userId, user.id), eq(userEpisodes.watched, true))
    );

  // Fetch movie reviews
  const movieReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, user.id), eq(reviews.itemType, 'movie')))
    .orderBy(reviews.updatedAt);

  // Calculate stats
  const totalWatched = await db
    .select()
    .from(userMovies)
    .where(
      and(eq(userMovies.userId, user.id), eq(userMovies.status, 'watched'))
    );

  // Calculate movie statistics
  const totalMovieWatchCount = calculateTotalMovieWatchCount(totalWatched);
  const movieWatchHours = calculateMovieWatchHours(totalWatched);
  const episodeWatchHours = calculateEpisodeWatchHours(watchedEpisodes);
  const totalWatchHours = movieWatchHours + episodeWatchHours;

  // Join movie reviews with watched movies data
  const moviesWithReviews = movieReviews
    .map((review) => {
      const movie = watchedMovies.find(
        (m) => m.movieId.toString() === review.itemId
      );
      return movie ? { ...movie, review } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Transform movies to Movie objects
  const movies: Movie[] = totalWatched.map((record) => ({
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
  const tvShows: TVShow[] = allTVShows.map((record) => ({
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

  const books: Book[] = readBooks.map((record) => ({
    key: record.bookId,
    title: record.bookTitle,
    author_name: record.bookAuthors
      ? JSON.parse(record.bookAuthors)
      : undefined,
    first_publish_year: record.bookFirstPublishYear || undefined,
    cover_i: record.bookCoverId || undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <BackButton variant="ghost" className="mb-4" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <Avatar
              src={user.image}
              alt={user.fullname}
              size="xl"
              className="w-32 h-32"
            />

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {user.fullname}
              </h1>
              <p className="text-muted-foreground mb-4">@{user.username}</p>

              {/* Follower Stats and Follow Button */}
              <div className="mb-4 flex justify-center md:justify-start">
                <UserFollowInfo
                  userId={user.id}
                  currentUserId={session?.user?.id}
                  showFollowButton={true}
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Joined{' '}
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {canViewPrivateContent ? (
                <>
                  {/* Stats */}
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
                          primaryValue: totalWatched.length,
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
                          primary: 'TV Shows',
                          primaryValue: allTVShows.length,
                          secondary: 'Episodes Watched',
                          secondaryValue: watchedEpisodes.length,
                          tertiary: 'Watch Time',
                          tertiaryValue: formatWatchTime(episodeWatchHours),
                        },
                      },
                      {
                        label: 'Books',
                        description: 'Reading History',
                        icon: <FiBookOpen className="w-8 h-8 text-accent" />,
                        bgColor: 'from-accent/20 to-accent/5',
                        textColor: 'text-accent',
                        value: {
                          primary: 'Books Read',
                          primaryValue: books.length,
                          secondary: 'Reading Progress',
                          secondaryValue: books.length, // Could be enhanced with reading progress later
                          tertiary: 'Library Size',
                          tertiaryValue: books.length,
                        },
                      },
                    ]}
                    className="mt-4"
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
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {canViewPrivateContent ? (
          <>
            {/* Watched Movies */}
            {movies.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <FiFilm className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    Watched Movies
                  </h2>
                </div>
                <MediaCarousel
                  items={movies}
                  type="movies"
                  title="Watched Movies"
                  emptyState={<p>No movies watched yet.</p>}
                />
              </section>
            )}

            {/* TV Shows */}
            {tvShows.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <FiTv className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    TV Shows
                  </h2>
                </div>
                <MediaCarousel
                  items={tvShows}
                  type="tvshows"
                  title="TV Shows"
                  emptyState={<p>No TV shows tracked yet.</p>}
                />
              </section>
            )}

            {/* Books */}
            {books.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <FiBookOpen className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    Read Books
                  </h2>
                </div>
                <MediaCarousel
                  items={books}
                  type="books"
                  title="Read Books"
                  emptyState={<p>No books read yet.</p>}
                />
              </section>
            )}
          </>
        ) : (
          /* Private Account Message */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="bg-card rounded-xl border border-border p-8 max-w-md w-full">
              <FiClock className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Private Account
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                This user&apos;s profile is private. Only their followers can
                view their watch history and statistics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {canViewPrivateContent && (
        <div className="container mx-auto px-4 py-12">
          {moviesWithReviews.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <FiStar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Movie Reviews ({moviesWithReviews.length})
                </h2>
              </div>
              <div className="space-y-4">
                {moviesWithReviews.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg p-6 border border-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.movieTitle}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <FiStar
                              key={index}
                              className={`w-4 h-4 ${
                                index < (item.review.rating || 0)
                                  ? 'text-warning fill-warning'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-semibold text-foreground ml-1">
                            {item.review.rating}/5
                          </span>
                        </div>
                        {item.review.comment && (
                          <p className="text-muted-foreground leading-relaxed">
                            {item.review.comment}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(item.review.updatedAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {totalWatched.length === 0 && (
            <div className="text-center py-12">
              <FiFilm className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No movies watched yet
              </h3>
              <p className="text-muted-foreground">
                {user.fullname} hasn&apos;t watched any movies yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
