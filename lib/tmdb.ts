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

async function fetchFromTMDB(endpoint: string) {
  const url = `${TMDB_BASE_URL}${endpoint}${
    endpoint.includes('?') ? '&' : '?'
  }api_key=${TMDB_API_KEY}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json();
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
