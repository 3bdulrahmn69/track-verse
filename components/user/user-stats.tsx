import { ReactNode } from 'react';
import { getUserStats, formatWatchTimeCounter } from '@/lib/server-utils';
import { FiFilm, FiTv, FiBookOpen, FiPlay } from 'react-icons/fi';

interface DetailedStatItem {
  value: {
    primary?: string;
    primaryValue?: string | number;
    secondary?: string;
    secondaryValue?:
      | string
      | number
      | { months: number; days: number; hours: number };
    tertiary?: string;
    tertiaryValue?:
      | string
      | number
      | { months: number; days: number; hours: number };
  };
  label: string;
  icon?: ReactNode;
  description?: string;
  bgColor?: string;
  textColor?: string;
}

interface UserStatsProps {
  userId?: string;
  stats?: Awaited<ReturnType<typeof getUserStats>>;
  variant?: 'simple' | 'detailed';
  className?: string;
}

export async function UserStats({
  userId,
  stats: providedStats,
  variant = 'simple',
  className = '',
}: UserStatsProps) {
  const stats = providedStats || (userId ? await getUserStats(userId) : null);

  if (!stats) {
    return null;
  }

  const detailedStats: DetailedStatItem[] = [
    {
      label: 'Movies',
      description: 'Watch History',
      icon: <FiFilm className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: 'from-primary/20 to-primary/5',
      value: {
        primary: 'Movies Watched',
        primaryValue: stats.movies.count,
        secondary: 'Total Views',
        secondaryValue: stats.movies.totalViews,
        tertiary: 'Watch Time',
        tertiaryValue: stats.movies.watchTime,
      },
    },
    {
      label: 'TV Shows',
      description: 'Episode Tracker',
      icon: <FiTv className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: 'from-secondary/20 to-secondary/5',
      textColor: 'text-secondary',
      value: {
        primary: 'TV Shows',
        primaryValue: stats.tvShows.count,
        secondary: 'Episodes Watched',
        secondaryValue: stats.tvShows.episodesWatched,
        tertiary: 'Watch Time',
        tertiaryValue: stats.tvShows.watchTime,
      },
    },
    {
      label: 'Books',
      description: 'Reading Journey',
      icon: <FiBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: 'from-accent/20 to-accent/5',
      textColor: 'text-accent',
      value: {
        primary: 'Books Read',
        primaryValue: stats.books.count,
        secondary: 'Pages Read',
        secondaryValue: stats.books.totalPages,
        tertiary: 'Avg. Rating',
        tertiaryValue:
          stats.books.avgRating !== 'N/A'
            ? stats.books.avgRating + ' ★'
            : 'N/A',
      },
    },
    {
      label: 'Games',
      description: 'Gaming Library',
      icon: <FiPlay className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: 'from-purple-500/20 to-purple-500/5',
      textColor: 'text-purple-500',
      value: {
        primary: 'Games Completed',
        primaryValue: stats.games.count,
        secondary: 'Avg. Playtime',
        secondaryValue: formatWatchTimeCounter(stats.games.avgPlaytime),
        tertiary: 'Avg. Rating',
        tertiaryValue:
          stats.games.avgRating !== 'N/A'
            ? stats.games.avgRating + ' ★'
            : 'N/A',
      },
    },
  ];

  if (variant === 'detailed') {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}
      >
        {detailedStats.map((stat, index) => {
          const detailedStat = stat as DetailedStatItem;
          return (
            <div
              key={index}
              className="relative bg-background text-foreground rounded-lg p-3 border border-border overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -translate-y-5 translate-x-5"></div>
              <div className="relative z-10">
                <div className="flex flex-row items-center text-center gap-2">
                  {/* Icon */}
                  <div className="p-1.5 bg-card rounded-lg border border-border">
                    <div className="text-primary text-sm">
                      {detailedStat.icon}
                    </div>
                  </div>

                  {/* Title and Subtitle */}
                  <div className="text-start">
                    <h3 className="text-sm font-bold text-primary">
                      {detailedStat.label}
                    </h3>
                    {detailedStat.description && (
                      <p className="text-xs text-muted-foreground">
                        {detailedStat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="flex flex-row justify-between items-center mt-3">
                  {detailedStat.value.primary && (
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.primary}
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {detailedStat.value.primaryValue}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.secondary && (
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.secondary}
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {typeof detailedStat.value.secondaryValue ===
                          'object' &&
                        'months' in detailedStat.value.secondaryValue ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.secondaryValue.months}
                              </span>
                              <span className="text-xs text-primary">M</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.secondaryValue.days}
                              </span>
                              <span className="text-xs text-primary">D</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.secondaryValue.hours}
                              </span>
                              <span className="text-xs text-primary">H</span>
                            </div>
                          </div>
                        ) : (
                          detailedStat.value.secondaryValue
                        )}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.tertiary && (
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.tertiary}
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {typeof detailedStat.value.tertiaryValue === 'object' &&
                        'months' in detailedStat.value.tertiaryValue ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.tertiaryValue.months}
                              </span>
                              <span className="text-xs text-primary">M</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.tertiaryValue.days}
                              </span>
                              <span className="text-xs text-primary">D</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-base font-medium">
                                {detailedStat.value.tertiaryValue.hours}
                              </span>
                              <span className="text-xs text-primary">H</span>
                            </div>
                          </div>
                        ) : (
                          detailedStat.value.tertiaryValue
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {stats.movies.count}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <FiFilm className="w-4 h-4" />
          Movies
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {stats.tvShows.count}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <FiTv className="w-4 h-4" />
          TV Shows
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {stats.books.count}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <FiBookOpen className="w-4 h-4" />
          Books
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {stats.games.count}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <FiPlay className="w-4 h-4" />
          Games
        </div>
      </div>
    </div>
  );
}
