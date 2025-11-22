import { FiCheck, FiCircle } from 'react-icons/fi';
import Image from 'next/image';
import { Popover } from '@/components/ui/popover';
import type { Episode } from '@/lib/tmdb';

interface EpisodeWithStatus extends Episode {
  watched: boolean;
  userRating?: number | null;
  userComment?: string | null;
}

interface EpisodeCardProps {
  episode: EpisodeWithStatus;
  onToggle: (episodeNumber: number, currentStatus: boolean) => void;
  onClick: (episode: EpisodeWithStatus) => void;
  isUpdating: boolean;
}

export function EpisodeCard({
  episode,
  onToggle,
  onClick,
  isUpdating,
}: EpisodeCardProps) {
  return (
    <div className="rounded-lg border transition-colors cursor-pointer bg-card border-border hover:border-primary/50">
      <div
        onClick={() => onClick(episode)}
        className="flex items-start gap-4 p-4"
      >
        {episode.still_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
            alt={episode.name}
            width={120}
            height={68}
            className="rounded shrink-0"
            sizes="120px"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {episode.episode_number}. {episode.name}
            </h3>
            {episode.runtime && (
              <span className="text-sm text-muted-foreground shrink-0">
                {episode.runtime} min
              </span>
            )}
          </div>
          {episode.air_date && (
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(episode.air_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {/* Overview on large screens */}
          {episode.overview && (
            <p className="hidden md:block text-sm text-foreground line-clamp-2">
              {episode.overview}
            </p>
          )}
        </div>

        <Popover
          content={episode.watched ? 'Mark as unwatched' : 'Mark as watched'}
          position="left"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(episode.episode_number, episode.watched);
            }}
            disabled={isUpdating}
            className={`shrink-0 mt-1 p-2 rounded-full transition-colors disabled:opacity-50 ${
              episode.watched
                ? 'bg-success text-success-foreground hover:bg-success/90'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {episode.watched ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiCircle className="w-5 h-5" />
            )}
          </button>
        </Popover>
      </div>

      {/* Overview on small screens */}
      {episode.overview && (
        <div onClick={() => onClick(episode)} className="md:hidden px-4 pb-4">
          <p className="text-sm text-foreground line-clamp-3">
            {episode.overview}
          </p>
        </div>
      )}
    </div>
  );
}
