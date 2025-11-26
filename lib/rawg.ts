const RAWG_API_KEY = process.env.RAWG_API_KEY;
console.log(process.env.TMDB_API_KEY);

const RAWG_BASE_URL = 'https://api.rawg.io/api';

export interface Game {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings: { id: number; title: string; count: number; percent: number }[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  esrb_rating: {
    id: number;
    name: string;
    slug: string;
  } | null;
  platforms: {
    platform: {
      id: number;
      name: string;
      slug: string;
    };
    released_at: string;
    requirements: {
      minimum: string;
      recommended: string;
    } | null;
  }[];
  genres: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  short_screenshots: { id: number; image: string }[];
}

export interface GameDetails extends Game {
  description: string;
  description_raw: string;
  metacritic: number | null;
  metacritic_platforms: {
    metascore: number;
    url: string;
    platform: {
      platform: number;
      name: string;
      slug: string;
    };
  }[];
  website: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  parent_platforms: {
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  publishers: { id: number; name: string; slug: string }[];
  developers: { id: number; name: string; slug: string }[];
  stores: {
    id: number;
    url: string;
    store: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  clip: {
    clip: string;
    clips: { [key: string]: string };
    video: string;
    preview: string;
  } | null;
  alternative_names: string[];
}

export interface GamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}

export interface Screenshot {
  id: number;
  image: string;
  width: number;
  height: number;
  is_deleted: boolean;
}

export interface ScreenshotsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Screenshot[];
}

// if (!RAWG_API_KEY) {
//   throw new Error('RAWG_API_KEY is not set in environment variables');
// }

async function fetchRAWG(
  endpoint: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`${RAWG_BASE_URL}${endpoint}`);
  url.searchParams.append('key', RAWG_API_KEY!);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.statusText}`);
  }

  return response.json();
}

// Get popular games
export async function getPopularGames(page = 1): Promise<GamesResponse> {
  return fetchRAWG('/games', {
    page: page.toString(),
    page_size: '20',
    ordering: '-added',
  });
}

// Get recent games
export async function getRecentGames(page = 1): Promise<GamesResponse> {
  const dates = getDateRange();
  return fetchRAWG('/games', {
    page: page.toString(),
    page_size: '20',
    dates: dates,
    ordering: '-released',
  });
}

// Get upcoming games
export async function getUpcomingGames(page = 1): Promise<GamesResponse> {
  const today = new Date();
  const nextYear = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );
  const dates = `${formatDate(today)},${formatDate(nextYear)}`;

  return fetchRAWG('/games', {
    page: page.toString(),
    page_size: '20',
    dates: dates,
    ordering: 'released',
  });
}

// Get game details
export async function getGameDetails(id: number): Promise<GameDetails> {
  return fetchRAWG(`/games/${id}`);
}

// Search games
export async function searchGames(
  query: string,
  page = 1
): Promise<GamesResponse> {
  return fetchRAWG('/games', {
    search: query,
    page: page.toString(),
    page_size: '20',
  });
}

// Get game screenshots
export async function getGameScreenshots(
  id: number
): Promise<ScreenshotsResponse> {
  return fetchRAWG(`/games/${id}/screenshots`, {
    page_size: '10',
  });
}

// Get similar games (games with same genres)
export async function getSimilarGames(gameId: number): Promise<GamesResponse> {
  const game = await getGameDetails(gameId);
  const genreIds = game.genres.map((g) => g.id).join(',');

  return fetchRAWG('/games', {
    genres: genreIds,
    page_size: '12',
    exclude_additions: 'true',
  });
}

// Get games by genre
export async function getGamesByGenre(
  genreId: number,
  page = 1
): Promise<GamesResponse> {
  return fetchRAWG('/games', {
    genres: genreId.toString(),
    page: page.toString(),
    page_size: '20',
  });
}

// Get games by platform
export async function getGamesByPlatform(
  platformId: number,
  page = 1
): Promise<GamesResponse> {
  return fetchRAWG('/games', {
    platforms: platformId.toString(),
    page: page.toString(),
    page_size: '20',
  });
}

// Helper functions
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(): string {
  const today = new Date();
  const lastYear = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );
  return `${formatDate(lastYear)},${formatDate(today)}`;
}

// Get image URL (RAWG images are already full URLs)
export function getGameImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return '/assets/placeholder-game.jpg';
  }
  return imagePath;
}
