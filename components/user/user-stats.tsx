import { ReactNode } from 'react';

interface SimpleStatItem {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface DetailedStatItem {
  value: {
    primary?: string;
    primaryValue?: string | number;
    secondary?: string;
    secondaryValue?: string | number;
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
  stats: (SimpleStatItem | DetailedStatItem)[];
  variant?: 'simple' | 'detailed';
  className?: string;
}

export function UserStats({
  stats,
  variant = 'simple',
  className = '',
}: UserStatsProps) {
  if (variant === 'detailed') {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      >
        {stats.map((stat, index) => {
          const detailedStat = stat as DetailedStatItem;
          return (
            <div
              key={index}
              className="relative bg-background text-foreground rounded-lg p-4 border border-border overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative z-10">
                <div className="flex flex-row items-center text-center gap-3">
                  {/* Icon */}
                  <div className="p-2 bg-card rounded-lg border border-border">
                    <div className="text-primary">{detailedStat.icon}</div>
                  </div>

                  {/* Title and Subtitle */}
                  <div className="text-start">
                    <h3 className="text-lg font-bold text-primary">
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
                <div className="flex flex-row justify-between items-center mt-4">
                  {detailedStat.value.primary && (
                    <div className="flex flex-col items-center text-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.primary}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {detailedStat.value.primaryValue}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.secondary && (
                    <div className="flex flex-col items-center text-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.secondary}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {detailedStat.value.secondaryValue}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.tertiary && (
                    <div className="flex flex-col items-center text-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {detailedStat.value.tertiary}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {typeof detailedStat.value.tertiaryValue === 'object' &&
                        'months' in detailedStat.value.tertiaryValue ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex items-center gap-0.5">
                              <span className="text-lg font-medium">
                                {detailedStat.value.tertiaryValue.months}
                              </span>
                              <span className="text-sm text-primary">M</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-lg font-medium">
                                {detailedStat.value.tertiaryValue.days}
                              </span>
                              <span className="text-sm text-primary">D</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-lg font-medium">
                                {detailedStat.value.tertiaryValue.hours}
                              </span>
                              <span className="text-sm text-primary">H</span>
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
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {stats.map((stat, index) => {
        const simpleStat = stat as SimpleStatItem;
        return (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {simpleStat.value}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              {simpleStat.icon}
              {simpleStat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
