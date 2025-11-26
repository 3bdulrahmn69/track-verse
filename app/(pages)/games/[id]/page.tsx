import Image from 'next/image';
import { FiCalendar, FiStar, FiTrendingUp } from 'react-icons/fi';
import {
  getGameDetails,
  getGameImageUrl,
  getGameScreenshots,
  getSimilarGames,
} from '@/lib/rawg';
import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import GameActions from '@/components/tabs/games/game-actions';
import { GameCard } from '@/components/tabs/games/game-card';

interface GamePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id: gameParam } = await params;
  const gameId = parseInt(gameParam);

  if (isNaN(gameId)) {
    notFound();
  }

  const [game, screenshots, similarGames] = await Promise.all([
    getGameDetails(gameId),
    getGameScreenshots(gameId),
    getSimilarGames(gameId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        {game.background_image && (
          <Image
            src={getGameImageUrl(game.background_image)}
            alt={game.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="mb-6">
          <BackButton href="/portal?tab=games" variant="outline" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-64 aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getGameImageUrl(game.background_image)}
                alt={game.name}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {game.name}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-foreground">
                <FiStar className="w-5 h-5 text-warning" />
                <span className="font-semibold">{game.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">
                  ({game.ratings_count.toLocaleString()} ratings)
                </span>
              </div>

              {game.released && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiCalendar className="w-5 h-5" />
                  <span>{new Date(game.released).getFullYear()}</span>
                </div>
              )}

              {game.metacritic && (
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary" />
                  <span className="px-3 py-1 rounded bg-primary/20 text-primary text-sm font-bold">
                    {game.metacritic}
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-6">
              <GameActions game={game} />
            </div>

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Available on
                </h4>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.slice(0, 6).map((platform) => (
                    <span
                      key={platform.platform.id}
                      className="px-3 py-1 rounded bg-muted text-foreground text-sm"
                    >
                      {platform.platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {game.description_raw && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  About
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {game.description_raw}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.developers && game.developers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Developers
                  </h4>
                  <p className="text-foreground">
                    {game.developers.map((dev) => dev.name).join(', ')}
                  </p>
                </div>
              )}

              {game.publishers && game.publishers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Publishers
                  </h4>
                  <p className="text-foreground">
                    {game.publishers.map((pub) => pub.name).join(', ')}
                  </p>
                </div>
              )}

              {game.esrb_rating && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    ESRB Rating
                  </h4>
                  <p className="text-foreground">{game.esrb_rating.name}</p>
                </div>
              )}

              {game.playtime > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Average Playtime
                  </h4>
                  <p className="text-foreground">{game.playtime} hours</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {screenshots.results.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Screenshots
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.results.slice(0, 6).map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="relative aspect-video rounded-lg overflow-hidden"
                >
                  <Image
                    src={screenshot.image}
                    alt={`${game.name} screenshot`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Games */}
        {similarGames.results.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Similar Games
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarGames.results.slice(0, 8).map((similarGame) => (
                <GameCard key={similarGame.id} game={similarGame} />
              ))}
            </div>
          </section>
        )}

        {/* Stores */}
        {game.stores && game.stores.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Where to Buy
            </h2>
            <div className="flex flex-wrap gap-4">
              {game.stores.map((store) => (
                <a
                  key={store.id}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {store.store.name}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
