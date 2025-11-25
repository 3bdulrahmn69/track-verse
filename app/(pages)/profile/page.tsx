import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  userMovies,
  userTvShows,
  userEpisodes,
  userBooks,
  reviews,
} from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { MediaCarousel } from '@/components/ui/media-carousel';
import Link from 'next/link';
import BackButton from '@/components/shared/back-button';
import { Avatar } from '@/components/ui/avatar';
import { UserStats } from '@/components/user/user-stats';
import { UserFollowInfo } from '@/components/user/user-follow-info';
import type { Movie } from '@/lib/tmdb';
import type { TVShow } from '@/lib/tmdb';
import type { Book } from '@/lib/books';
import {
  calculateTotalMovieWatchCount,
  calculateMovieWatchHours,
  calculateEpisodeWatchHours,
  formatWatchTimeCounter,
} from '@/lib/utils';
import {
  FiUser,
  FiFilm,
  FiClock,
  FiEdit2,
  FiTv,
  FiBookOpen,
} from 'react-icons/fi';

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

  // Fetch user's read books
  const readBooks = await db
    .select()
    .from(userBooks)
    .where(
      and(eq(userBooks.userId, session.user.id), eq(userBooks.status, 'read'))
    );

  // Fetch book reviews for average rating calculation
  const bookReviews = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.userId, session.user.id), eq(reviews.itemType, 'book'))
    );

  // Calculate average book rating
  const avgBookRating =
    bookReviews.length > 0
      ? (
          bookReviews.reduce((sum, review) => sum + review.rating, 0) /
          bookReviews.length
        ).toFixed(1)
      : 'N/A';

  // Calculate total pages read
  const totalPagesRead = readBooks.reduce((total, book) => {
    return total + (book.totalPages || 0);
  }, 0);

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

  // Transform books to Book objects
  const books: Book[] = readBooks.map((record) => ({
    key: record.bookId,
    title: record.bookTitle,
    author_name: record.bookAuthors ? JSON.parse(record.bookAuthors) : [],
    first_publish_year: record.bookFirstPublishYear || undefined,
    cover_i: record.bookCoverId || undefined,
    subject: [],
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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <nav className="mb-4 sm:mb-6">
          <BackButton />
        </nav>

        {/* Profile Header Section */}
        <header className="bg-card rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-8 lg:mb-12">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-6">
            {/* Avatar */}
            <figure className="shrink-0">
              <Avatar
                src={session.user.image}
                alt={session.user.name || 'User'}
                size="xl"
                className="w-24 h-24 sm:w-32 sm:h-32"
              />
            </figure>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
              <div className="relative mb-2 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground relative inline-block">
                  {session.user.name}
                  <Link
                    href="/settings"
                    className="absolute -top-2 -right-5 p-1 hover:bg-accent rounded-full transition-colors"
                    aria-label="Edit profile"
                  >
                    <FiEdit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                </h1>
              </div>

              <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    @{session.user.username}
                  </span>
                </div>
              </div>

              {/* Follower Stats (no follow button on own profile) */}
              <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                <UserFollowInfo
                  userId={session.user.id}
                  currentUserId={session.user.id}
                  showFollowButton={false}
                />
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
                icon: <FiFilm className="w-5 h-5 sm:w-6 sm:h-6" />,
                bgColor: 'from-primary/20 to-primary/5',
                value: {
                  primary: 'Movies Watched',
                  primaryValue: movies.length,
                  secondary: 'Total Views',
                  secondaryValue: totalMovieWatchCount,
                  tertiary: 'Watch Time',
                  tertiaryValue: formatWatchTimeCounter(movieWatchHours),
                },
              },
              {
                label: 'TV Shows',
                description: 'Episode Tracker',
                icon: <FiTv className="w-5 h-5 sm:w-6 sm:h-6" />,
                bgColor: 'from-secondary/20 to-secondary/5',
                textColor: 'text-secondary',
                value: {
                  primary: 'Shows Completed',
                  primaryValue: completedTVShows.length,
                  secondary: 'Episodes Watched',
                  secondaryValue: watchedEpisodes.length,
                  tertiary: 'Watch Time',
                  tertiaryValue: formatWatchTimeCounter(episodeWatchHours),
                },
              },
              {
                label: 'Books',
                description: 'Reading Journey',
                icon: <FiBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
                bgColor: 'from-accent/20 to-accent/5',
                textColor: 'text-accent',
                value: {
                  primary: 'Books Read',
                  primaryValue: books.length,
                  secondary: 'Pages Read',
                  secondaryValue: totalPagesRead,
                  tertiary: 'Avg. Rating',
                  tertiaryValue:
                    avgBookRating !== 'N/A' ? avgBookRating + ' ★' : 'N/A',
                },
              },
            ]}
            className="mt-6 lg:mt-8"
          />

          {/* Total Watch Time Summary */}
          <div className="mt-6 p-4 sm:p-6 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Watch Time
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              {(() => {
                const timeCounter = formatWatchTimeCounter(totalWatchHours);
                return (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {timeCounter.months}
                      </span>
                      <span className="text-xs text-muted-foreground">M</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {timeCounter.days}
                      </span>
                      <span className="text-xs text-muted-foreground">D</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {timeCounter.hours}
                      </span>
                      <span className="text-xs text-muted-foreground">H</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </header>

        {/* Watched Movies Section */}
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
            emptyState={
              <div className="text-center py-12 sm:py-16">
                <FiFilm className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  No Movies Watched Yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Start watching movies and they&apos;ll appear here!
                </p>
              </div>
            }
          />
        </section>

        {/* TV Shows Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <FiTv className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">TV Shows</h2>
          </div>
          <MediaCarousel
            items={tvShows}
            type="tvshows"
            title="TV Shows"
            emptyState={
              <div className="text-center py-12 sm:py-16">
                <FiTv className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  No TV Shows Added Yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Add TV shows to your watchlist and they&apos;ll appear here!
                </p>
              </div>
            }
          />
        </section>

        {/* Read Books Section */}
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
            emptyState={
              <div className="text-center py-12 sm:py-16">
                <FiBookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  No Books Read Yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Start reading books and they&apos;ll appear here!
                </p>
              </div>
            }
          />
        </section>
      </div>
    </div>
  );
}
