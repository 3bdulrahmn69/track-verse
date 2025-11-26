import { db } from '@/lib/db';
import {
  userMovies,
  userTvShows,
  userEpisodes,
  userBooks,
  userGames,
  reviews,
} from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';

// Utility function to get user statistics
export async function getUserStats(userId: string) {
  // Fetch user's watched movies
  const watchedMovies = await db
    .select()
    .from(userMovies)
    .where(
      and(eq(userMovies.userId, userId), eq(userMovies.status, 'watched'))
    );

  // Fetch user's TV shows except want_to_watch
  const allTVShows = await db
    .select()
    .from(userTvShows)
    .where(
      and(
        eq(userTvShows.userId, userId),
        ne(userTvShows.status, 'want_to_watch')
      )
    );

  // Fetch user's read books
  const readBooks = await db
    .select()
    .from(userBooks)
    .where(and(eq(userBooks.userId, userId), eq(userBooks.status, 'read')));

  // Fetch user's completed games
  const completedGames = await db
    .select()
    .from(userGames)
    .where(
      and(eq(userGames.userId, userId), eq(userGames.status, 'completed'))
    );

  // Get watched episodes count
  const watchedEpisodes = await db
    .select()
    .from(userEpisodes)
    .where(
      and(eq(userEpisodes.userId, userId), eq(userEpisodes.watched, true))
    );

  // Calculate statistics
  const totalMovieWatchCount = calculateTotalMovieWatchCount(watchedMovies);
  const movieWatchHours = calculateMovieWatchHours(watchedMovies);
  const episodeWatchHours = calculateEpisodeWatchHours(watchedEpisodes);

  // Calculate total pages read
  const totalPagesRead = readBooks.reduce((total, book) => {
    return total + (book.totalPages || 0);
  }, 0);

  // Calculate average book rating
  const bookReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.itemType, 'book')));

  const avgBookRating =
    bookReviews.length > 0
      ? (
          bookReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          bookReviews.length
        ).toFixed(1)
      : 'N/A';

  return {
    movies: {
      count: watchedMovies.length,
      totalViews: totalMovieWatchCount,
      watchTime: formatWatchTimeCounter(movieWatchHours),
    },
    tvShows: {
      count: allTVShows.length,
      episodesWatched: watchedEpisodes.length,
      watchTime: formatWatchTimeCounter(episodeWatchHours),
    },
    books: {
      count: readBooks.length,
      totalPages: totalPagesRead,
      avgRating: avgBookRating,
    },
    games: {
      count: completedGames.length,
      avgPlaytime:
        completedGames.length > 0
          ? completedGames.reduce(
              (total, game) => total + (game.avgPlaytime || 0),
              0
            ) / completedGames.length
          : 0,
      avgRating:
        completedGames.length > 0
          ? (
              completedGames.reduce(
                (sum, game) => sum + Number(game.rating || 0),
                0
              ) / completedGames.length
            ).toFixed(1)
          : 'N/A',
    },
  };
}

// Types for calculation functions
interface WatchedMovie {
  watchCount?: number | null;
  runtime?: number | null;
}

interface WatchedEpisode {
  runtime?: number | null;
  watched: boolean;
}

// Calculation functions for profile statistics
export function calculateTotalMovieWatchCount(watchedMovies: WatchedMovie[]) {
  return watchedMovies.reduce(
    (sum, movie) => sum + Math.max(movie.watchCount || 0, 1),
    0
  );
}

export function calculateMovieWatchHours(watchedMovies: WatchedMovie[]) {
  return watchedMovies.reduce((total, movie) => {
    if (movie.runtime) {
      const count = Math.max(movie.watchCount || 0, 1);
      return total + (movie.runtime * count) / 60; // Convert minutes to hours
    }
    return total;
  }, 0);
}

export function calculateEpisodeWatchHours(watchedEpisodes: WatchedEpisode[]) {
  return watchedEpisodes.reduce((total, episode) => {
    if (episode.runtime && episode.watched) {
      return total + episode.runtime / 60; // Convert minutes to hours
    }
    return total;
  }, 0);
}

// Helper function to convert hours to months/days/hours counter format
export function formatWatchTimeCounter(totalHours: number) {
  const hoursPerDay = 24;
  const daysPerMonth = 30; // Approximate

  const totalDays = Math.floor(totalHours / hoursPerDay);
  const remainingHours = Math.floor(totalHours % hoursPerDay);

  const months = Math.floor(totalDays / daysPerMonth);
  const remainingDays = totalDays % daysPerMonth;

  return {
    months,
    days: remainingDays,
    hours: remainingHours,
  };
}
