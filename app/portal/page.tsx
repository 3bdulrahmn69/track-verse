import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { PortalTabs } from '@/components/portal/portal-tabs';
import MoviesTab from '@/components/tabs/movies/movies-tab';
import TvShowsTab from '@/components/tabs/tv-shows/tv-shows-tab';
import BooksTab from '@/components/tabs/books/books-tab';
import GamesTab from '@/components/tabs/games/games-tab';
import { getPopularMovies, getNowPlayingMovies } from '@/lib/tmdb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal | Track Verse - Your Entertainment Dashboard',
  description:
    'Access your personalized entertainment portal. Track movies, TV shows, books, and video games. Discover trending content and manage your watchlists.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PortalPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { tab } = await searchParams;
  const validTabs = ['movies', 'tv-shows', 'books', 'games'];
  const initialTab = validTabs.includes(tab || '')
    ? (tab as 'movies' | 'tv-shows' | 'books' | 'games')
    : 'movies';

  // Fetch movie data
  const [popularMovies, nowPlayingMovies] = await Promise.all([
    getPopularMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <PortalTabs
      initialTab={initialTab}
      moviesTab={
        <MoviesTab
          popularMovies={popularMovies.results}
          nowPlayingMovies={nowPlayingMovies.results}
        />
      }
      tvShowsTab={<TvShowsTab />}
      booksTab={<BooksTab />}
      gamesTab={<GamesTab />}
    />
  );
}
