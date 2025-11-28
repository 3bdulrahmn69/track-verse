import React from 'react';
import {
  MdMovie,
  MdOndemandVideo,
  MdLibraryBooks,
  MdVideogameAsset,
} from 'react-icons/md';
import { Container } from '../layout/container';

const features = [
  {
    title: 'Movies',
    description:
      'Track your favorite movies with ratings, reviews, and watch lists. Discover trending films and manage your personal cinema collection.',
    icon: MdMovie,
    gradient: 'from-red-500 to-pink-500',
  },
  {
    title: 'TV Shows',
    description:
      'Track TV shows and series with episode guides, watch history, and recommendations. Never miss an episode of your favorite series.',
    icon: MdOndemandVideo,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Books',
    description:
      'Keep track of books, reading progress, notes, and quotes. Build your personal library and track your reading journey.',
    icon: MdLibraryBooks,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Games',
    description:
      'Log video games, playtime, achievements, and reviews. Track your gaming progress and discover new titles to play.',
    icon: MdVideogameAsset,
    gradient: 'from-purple-500 to-violet-500',
  },
];

const FeaturesCard = ({
  children,
  className,
  gradient,
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) => {
  return (
    <div
      className={`group relative bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${className}`}
    >
      {/* Gradient background overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-linear-to-br from-accent/10 to-primary/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-300" />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-linear-to-br from-background via-muted/30 to-background relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
      </div>

      <Container className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Your Complete Tracking Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Access all your tracking needs in one comprehensive, easy-to-use
            dashboard designed for entertainment and personal organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <FeaturesCard
                key={index}
                gradient={feature.gradient}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-1 bg-linear-to-r from-primary to-accent rounded-full mx-auto" />
                </div>
              </FeaturesCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
