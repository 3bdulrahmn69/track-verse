import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to convert hours to months/days/hours format
export function formatWatchTime(totalHours: number) {
  const hoursPerDay = 24;
  const daysPerMonth = 30; // Approximate

  const totalDays = Math.floor(totalHours / hoursPerDay);
  const remainingHours = totalHours % hoursPerDay;

  const months = Math.floor(totalDays / daysPerMonth);
  const remainingDays = totalDays % daysPerMonth;

  const parts = [];
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (remainingDays > 0)
    parts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);
  if (remainingHours > 0)
    parts.push(
      `${parseFloat(remainingHours.toFixed(1))} hour${
        remainingHours > 1 ? 's' : ''
      }`
    );

  return parts.length > 0 ? parts.join(', ') : '0 hours';
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
