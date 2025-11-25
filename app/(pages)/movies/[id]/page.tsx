import Image from 'next/image';
import { FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import {
  getMovieDetails,
  getImageUrl,
  getMovieCredits,
  getSimilarMovies,
  getMovieVideos,
} from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import MovieActions from '@/components/tabs/movies/movie-actions';
import { MovieDetailsTabs } from '@/components/tabs/movies/movie-details-tabs';
import { TrailerPlayer } from '@/components/shared/trailer-player';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id: movieParam } = await params;
  const movieId = parseInt(movieParam);

  if (isNaN(movieId)) {
    notFound();
  }

  const [movie, credits, similarMovies, videos] = await Promise.all([
    getMovieDetails(movieId),
    getMovieCredits(movieId),
    getSimilarMovies(movieId),
    getMovieVideos(movieId),
  ]);

  // Get trailer
  const trailer = videos.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  // Get director
  const director = credits.crew.find((person) => person.job === 'Director');

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        {movie.backdrop_path && (
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
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
          <BackButton variant="outline" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-64 aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xl text-muted-foreground italic mb-4">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-foreground">
                <FiStar className="w-5 h-5 text-warning" />
                <span className="font-semibold">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({movie.vote_count.toLocaleString()} votes)
                </span>
              </div>

              {movie.release_date && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiCalendar className="w-5 h-5" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiClock className="w-5 h-5" />
                  <span>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
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
              <MovieActions movie={movie} />
            </div>

            {/* Director and Trailer */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {director && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Director
                  </h4>
                  <p className="text-foreground">{director.name}</p>
                </div>
              )}

              {trailer && (
                <TrailerPlayer videoKey={trailer.key} title={movie.title} />
              )}
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Overview
              </h2>
              <p className="text-foreground leading-relaxed">
                {movie.overview}
              </p>
            </div>

            {/* Production Info */}
            {movie.production_companies &&
              movie.production_companies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Production Companies
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.production_companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card"
                      >
                        {company.logo_path && (
                          <div className="relative w-12 h-12">
                            <Image
                              src={getImageUrl(company.logo_path, 'w185')}
                              alt={company.name}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <span className="text-foreground text-sm">
                          {company.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.status && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Status
                  </h4>
                  <p className="text-foreground">{movie.status}</p>
                </div>
              )}

              {movie.budget > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Budget
                  </h4>
                  <p className="text-foreground">
                    ${movie.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {movie.revenue > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Revenue
                  </h4>
                  <p className="text-foreground">
                    ${movie.revenue.toLocaleString()}
                  </p>
                </div>
              )}

              {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Languages
                  </h4>
                  <p className="text-foreground">
                    {movie.spoken_languages.map((lang) => lang.name).join(', ')}
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

        {/* Similar Movies and Comments Tabs */}
        <section className="mt-12">
          <MovieDetailsTabs
            movieId={movie.id}
            movieTitle={movie.title}
            similarMovies={similarMovies.results}
          />
        </section>
      </div>
    </div>
  );
}
