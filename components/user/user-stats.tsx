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
    tertiaryValue?: string | number;
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
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {stats.map((stat, index) => {
          const detailedStat = stat as DetailedStatItem;
          return (
            <div
              key={index}
              className={`relative bg-linear-to-br ${
                detailedStat.bgColor || 'from-primary/20 to-primary/5'
              } rounded-2xl p-6 border ${
                detailedStat.bgColor?.replace('from-', 'border-') ||
                'border-primary/20'
              } overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 ${
                      detailedStat.bgColor
                        ?.replace('from-', '')
                        ?.replace('/20', '/20') || 'bg-primary/20'
                    } rounded-xl`}
                  >
                    {detailedStat.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {detailedStat.label}
                    </h3>
                    {detailedStat.description && (
                      <p className="text-sm text-muted-foreground">
                        {detailedStat.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {detailedStat.value.primary && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {detailedStat.value.primary}
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        {detailedStat.value.primaryValue}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.secondary && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {detailedStat.value.secondary}
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        {detailedStat.value.secondaryValue}
                      </span>
                    </div>
                  )}
                  {detailedStat.value.tertiary && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {detailedStat.value.tertiary}
                      </span>
                      <span
                        className={`text-lg font-semibold ${
                          detailedStat.textColor || 'text-primary'
                        }`}
                      >
                        {detailedStat.value.tertiaryValue}
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
