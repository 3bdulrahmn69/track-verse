import Image from 'next/image';
import { FiCalendar, FiStar, FiTv } from 'react-icons/fi';
import {
  getTVShowDetails,
  getImageUrl,
  getTVShowCredits,
  getSimilarTVShows,
  getTVShowVideos,
} from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import TVShowActions from '@/components/tabs/tv-shows/tv-show-actions';
import { TVShowDetailsTabs } from '@/components/tabs/tv-shows/tv-show-details-tabs';
import { SeasonTracker } from '@/components/tabs/tv-shows/season-tracker';
import { TrailerPlayer } from '@/components/shared/trailer-player';
import type { Metadata } from 'next';

interface TVShowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TVShowPageProps): Promise<Metadata> {
  const { id: tvShowParam } = await params;
  const tvShowId = parseInt(tvShowParam);

  if (isNaN(tvShowId)) {
    return {
      title: 'TV Show Not Found',
    };
  }

  try {
    const tvShow = await getTVShowDetails(tvShowId);
    const posterUrl = tvShow.poster_path
      ? getImageUrl(tvShow.poster_path, 'w500')
      : undefined;

    return {
      title: `${tvShow.name} (${new Date(
        tvShow.first_air_date
      ).getFullYear()}) - TV Show Details`,
      description:
        tvShow.overview ||
        `Watch ${tvShow.name} on Track Verse. Track your progress, rate, and review this TV show.`,
      keywords: [
        tvShow.name,
        'tv show',
        'watch series',
        'tv series',
        'track verse',
        ...(tvShow.genres?.map((g) => g.name) || []),
      ],
      openGraph: {
        title: `${tvShow.name} (${new Date(
          tvShow.first_air_date
        ).getFullYear()})`,
        description: tvShow.overview || `Watch ${tvShow.name} on Track Verse`,
        type: 'video.tv_show',
        url: `https://track-verse.vercel.app/tv-shows/${tvShowId}`,
        images: posterUrl
          ? [
              {
                url: posterUrl,
                width: 500,
                height: 750,
                alt: tvShow.name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: tvShow.name,
        description: tvShow.overview?.substring(0, 160) || '',
        images: posterUrl ? [posterUrl] : [],
      },
      alternates: {
        canonical: `https://track-verse.vercel.app/tv-shows/${tvShowId}`,
      },
    };
  } catch {
    return {
      title: 'TV Show Not Found',
    };
  }
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const { id: tvShowParam } = await params;
  const tvShowId = parseInt(tvShowParam);

  if (isNaN(tvShowId)) {
    notFound();
  }

  const [tvShow, credits, similarShows, videos] = await Promise.all([
    getTVShowDetails(tvShowId),
    getTVShowCredits(tvShowId),
    getSimilarTVShows(tvShowId),
    getTVShowVideos(tvShowId),
  ]);

  // Get trailer
  const trailer = videos.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  // Get creators
  const creators = tvShow.created_by || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        {tvShow.backdrop_path && (
          <Image
            src={getImageUrl(tvShow.backdrop_path, 'original')}
            alt={tvShow.name}
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
          <BackButton href="/portal?tab=tv-shows" variant="outline" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-64 aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(tvShow.poster_path, 'w500')}
                alt={tvShow.name}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {tvShow.name}
            </h1>

            {tvShow.tagline && (
              <p className="text-xl text-muted-foreground italic mb-4">
                &ldquo;{tvShow.tagline}&rdquo;
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-foreground">
                <FiStar className="w-5 h-5 text-warning" />
                <span className="font-semibold">
                  {Number(tvShow.vote_average).toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({tvShow.vote_count.toLocaleString()} votes)
                </span>
              </div>

              {tvShow.first_air_date && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiCalendar className="w-5 h-5" />
                  <span>
                    {new Date(tvShow.first_air_date).getFullYear()}
                    {tvShow.last_air_date &&
                      tvShow.status !== 'Returning Series' &&
                      ` - ${new Date(tvShow.last_air_date).getFullYear()}`}
                  </span>
                </div>
              )}

              {tvShow.number_of_seasons && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiTv className="w-5 h-5" />
                  <span>
                    {tvShow.number_of_seasons} Season
                    {tvShow.number_of_seasons > 1 ? 's' : ''} •{' '}
                    {tvShow.number_of_episodes} Episodes
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {tvShow.genres && tvShow.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tvShow.genres.map((genre) => (
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
              <TVShowActions
                tvShowId={tvShow.id}
                tvShowName={tvShow.name}
                tvShowPosterPath={tvShow.poster_path}
                tvShowFirstAirDate={tvShow.first_air_date}
              />
            </div>

            {/* Creators and Trailer */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {creators.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Created By
                  </h4>
                  <p className="text-foreground">
                    {creators.map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}

              {trailer && (
                <TrailerPlayer videoKey={trailer.key} title={tvShow.name} />
              )}
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Overview
              </h2>
              <p className="text-foreground leading-relaxed">
                {tvShow.overview}
              </p>
            </div>

            {/* Networks */}
            {tvShow.networks && tvShow.networks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Networks
                </h3>
                <div className="flex flex-wrap gap-4">
                  {tvShow.networks.map((network) => (
                    <div
                      key={network.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card"
                    >
                      {network.logo_path && (
                        <div className="relative w-12 h-12">
                          <Image
                            src={getImageUrl(network.logo_path, 'w185')}
                            alt={network.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <span className="text-foreground text-sm">
                        {network.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tvShow.status && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Status
                  </h4>
                  <p className="text-foreground">{tvShow.status}</p>
                </div>
              )}

              {tvShow.type && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Type
                  </h4>
                  <p className="text-foreground">{tvShow.type}</p>
                </div>
              )}

              {tvShow.episode_run_time &&
                tvShow.episode_run_time.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      Episode Runtime
                    </h4>
                    <p className="text-foreground">
                      {tvShow.episode_run_time[0]} minutes
                    </p>
                  </div>
                )}

              {tvShow.languages && tvShow.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Languages
                  </h4>
                  <p className="text-foreground">
                    {tvShow.languages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {credits.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {credits.cast.slice(0, 12).map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 bg-muted">
                    {person.profile_path ? (
                      <Image
                        src={getImageUrl(person.profile_path, 'w185')}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.67vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-foreground text-sm">
                    {person.name}
                  </p>
                  <p className="text-muted-foreground text-xs line-clamp-2">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seasons */}
        {tvShow.seasons && tvShow.seasons.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Episodes
            </h2>
            <SeasonTracker tvShowId={tvShow.id} seasons={tvShow.seasons} />
          </section>
        )}

        {/* Similar Shows */}
        <section className="mt-12">
          <TVShowDetailsTabs similarShows={similarShows.results} />
        </section>
      </div>
    </div>
  );
}
