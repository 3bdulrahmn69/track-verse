import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { PortalTabs } from '@/components/portal/portal-tabs';
import MoviesTab from '@/components/tabs/movies/movies-tab';
import TvShowsTab from '@/components/tabs/tv-shows/tv-shows-tab';
import BooksTab from '@/components/tabs/books/books-tab';
import GamesTab from '@/components/tabs/games/games-tab';
import { getPopularMovies, getNowPlayingMovies } from '@/lib/tmdb';

export default async function PortalPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch movie data
  const [popularMovies, nowPlayingMovies] = await Promise.all([
    getPopularMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <PortalTabs
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
