const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string;
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface CrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

// TV Show Types
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TVShowDetails extends TVShow {
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  seasons: Season[];
  status: string;
  tagline: string;
  type: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface SeasonDetails extends Season {
  _id: string;
  episodes: Episode[];
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: CastMember[];
}

export interface TVShowsResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export interface TVShowCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined in environment variables');
  }

  const url = `${TMDB_BASE_URL}${endpoint}${
    endpoint.includes('?') ? '&' : '?'
  }api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('TMDB API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.replace(TMDB_API_KEY, '***'),
        body: errorBody,
      });
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error('TMDB Fetch Error:', error);
    throw error;
  }
}

export async function getPopularMovies(
  page: number = 1
): Promise<MoviesResponse> {
  return fetchFromTMDB(`/movie/popular?page=${page}`);
}

export async function getNowPlayingMovies(
  page: number = 1
): Promise<MoviesResponse> {
  return fetchFromTMDB(`/movie/now_playing?page=${page}`);
}

export async function getTopRatedMovies(
  page: number = 1
): Promise<MoviesResponse> {
  return fetchFromTMDB(`/movie/top_rated?page=${page}`);
}

export async function getUpcomingMovies(
  page: number = 1
): Promise<MoviesResponse> {
  return fetchFromTMDB(`/movie/upcoming?page=${page}`);
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return fetchFromTMDB(`/movie/${movieId}`);
}

export async function getMovieCredits(movieId: number): Promise<MovieCredits> {
  return fetchFromTMDB(`/movie/${movieId}/credits`);
}

export async function getSimilarMovies(
  movieId: number,
  page: number = 1
): Promise<MoviesResponse> {
  return fetchFromTMDB(`/movie/${movieId}/similar?page=${page}`);
}

export async function getMovieVideos(movieId: number): Promise<VideosResponse> {
  return fetchFromTMDB(`/movie/${movieId}/videos`);
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<MoviesResponse> {
  const encodedQuery = encodeURIComponent(query);
  return fetchFromTMDB(`/search/movie?query=${encodedQuery}&page=${page}`);
}

export function getImageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  if (!path) return '/assets/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// TV Show API Functions
export async function getPopularTVShows(
  page: number = 1
): Promise<TVShowsResponse> {
  return fetchFromTMDB(`/tv/popular?page=${page}`);
}

export async function getTopRatedTVShows(
  page: number = 1
): Promise<TVShowsResponse> {
  return fetchFromTMDB(`/tv/top_rated?page=${page}`);
}

export async function getOnTheAirTVShows(
  page: number = 1
): Promise<TVShowsResponse> {
  return fetchFromTMDB(`/tv/on_the_air?page=${page}`);
}

export async function getAiringTodayTVShows(
  page: number = 1
): Promise<TVShowsResponse> {
  return fetchFromTMDB(`/tv/airing_today?page=${page}`);
}

export async function getTVShowDetails(tvId: number): Promise<TVShowDetails> {
  return fetchFromTMDB(`/tv/${tvId}`);
}

export async function getTVShowCredits(tvId: number): Promise<TVShowCredits> {
  return fetchFromTMDB(`/tv/${tvId}/credits`);
}

export async function getSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<SeasonDetails> {
  return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getSimilarTVShows(
  tvId: number,
  page: number = 1
): Promise<TVShowsResponse> {
  return fetchFromTMDB(`/tv/${tvId}/similar?page=${page}`);
}

export async function getTVShowVideos(tvId: number): Promise<VideosResponse> {
  return fetchFromTMDB(`/tv/${tvId}/videos`);
}

export async function searchTVShows(
  query: string,
  page: number = 1
): Promise<TVShowsResponse> {
  const encodedQuery = encodeURIComponent(query);
  return fetchFromTMDB(`/search/tv?query=${encodedQuery}&page=${page}`);
}
