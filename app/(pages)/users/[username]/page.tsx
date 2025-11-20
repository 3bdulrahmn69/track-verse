import { notFound } from 'next/navigation';
import { FiCalendar, FiFilm, FiStar } from 'react-icons/fi';
import { db } from '@/lib/db';
import { users, userMovies } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { MovieCard } from '@/components/tabs/movies/movie-card';
import { getMovieDetails } from '@/lib/tmdb';
import BackButton from '@/components/shared/back-button';
import { Avatar } from '@/components/ui/avatar';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  // Fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    notFound();
  }

  // Fetch user's watched movies with ratings
  const watchedMovies = await db
    .select()
    .from(userMovies)
    .where(
      and(
        eq(userMovies.userId, user.id),
        eq(userMovies.status, 'watched'),
        isNotNull(userMovies.userRating)
      )
    )
    .orderBy(userMovies.updatedAt);

  // Fetch user's watchlist
  const watchlist = await db
    .select()
    .from(userMovies)
    .where(
      and(
        eq(userMovies.userId, user.id),
        eq(userMovies.status, 'want_to_watch')
      )
    )
    .orderBy(userMovies.updatedAt);

  // Calculate stats
  const totalWatched = await db
    .select()
    .from(userMovies)
    .where(
      and(eq(userMovies.userId, user.id), eq(userMovies.status, 'watched'))
    );

  const averageRating =
    watchedMovies.length > 0
      ? (
          watchedMovies.reduce(
            (sum, movie) => sum + (movie.userRating || 0),
            0
          ) / watchedMovies.length
        ).toFixed(1)
      : '0';

  // Fetch TMDB details for recent watched movies
  const recentWatchedWithDetails = await Promise.all(
    watchedMovies.slice(0, 6).map(async (movie) => {
      try {
        const details = await getMovieDetails(movie.movieId);
        return { ...movie, tmdbDetails: details };
      } catch {
        return null;
      }
    })
  );

  const validRecentWatched = recentWatchedWithDetails.filter((m) => m !== null);

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

              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {totalWatched.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Movies Watched
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {watchlist.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Watchlist</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Watched Movies */}
      <div className="container mx-auto px-4 py-12">
        {validRecentWatched.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FiFilm className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Recently Watched
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {validRecentWatched.map((item) => (
                <MovieCard key={item.movieId} movie={item.tmdbDetails} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {watchedMovies.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <FiStar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Movie Reviews ({watchedMovies.length})
              </h2>
            </div>
            <div className="space-y-4">
              {watchedMovies.slice(0, 10).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-card rounded-lg p-6 border border-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {movie.movieTitle}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FiStar
                            key={index}
                            className={`w-4 h-4 ${
                              index < (movie.userRating || 0)
                                ? 'text-warning fill-warning'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-foreground ml-1">
                          {movie.userRating}/5
                        </span>
                      </div>
                      {movie.userComment && (
                        <p className="text-muted-foreground leading-relaxed">
                          {movie.userComment}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(movie.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
    </div>
  );
}
