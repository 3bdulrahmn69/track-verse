import {
  MdMovie,
  MdPeople,
  MdStorage,
  MdNotifications,
  MdSecurity,
} from 'react-icons/md';
import { Container } from '../layout/container';

const features = [
  {
    icon: MdMovie,
    color: 'primary',
    title: 'Unified Platform',
    description:
      'Single application for all media types (movies, TV shows, books, games)',
  },
  {
    icon: MdPeople,
    color: 'accent',
    title: 'Social Integration',
    description:
      'Follow friends, see activity feeds, and discover content socially',
  },
  {
    icon: MdStorage,
    color: 'secondary',
    title: 'Rich Metadata',
    description:
      'Integration with industry-leading APIs (TMDB, RAWG, Open Library)',
  },
  {
    icon: MdNotifications,
    color: 'success',
    title: 'Real-time Updates',
    description: 'Live notifications and activity feeds powered by Redis',
  },
  {
    icon: MdSecurity,
    color: 'info',
    title: 'Privacy Controls',
    description: 'Granular privacy settings for public/private profiles',
  },
];

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const Icon = feature.icon;
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-48 flex flex-col">
      <div
        className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4 shrink-0`}
      >
        <Icon className={`w-6 h-6 text-${feature.color}`} />
      </div>
      <h4 className="text-lg font-semibold text-card-foreground mb-2 shrink-0">
        {feature.title}
      </h4>
      <p className="text-muted-foreground flex-1">{feature.description}</p>
    </div>
  );
}

export default function About() {
  return (
    <section className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            About Track Verse
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Track Verse is a comprehensive media tracking and social platform
            that allows users to track, review, and share their consumption of
            movies, TV shows, books, and video games. The application provides a
            unified dashboard for managing personal media libraries while
            fostering a social community around shared interests.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Our Mission
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            To create the ultimate media tracking experience where users can
            maintain detailed personal collections, discover new content through
            social connections, and engage with a community of fellow
            entertainment enthusiasts.
          </p>
        </div>

        <div className="space-y-8">
          {/* First row: 3 cards centered */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full sm:max-w-6xl">
              {features.slice(0, 3).map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>

          {/* Second row: 2 cards centered */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full sm:max-w-4xl">
              {features.slice(3).map((feature, index) => (
                <FeatureCard key={index + 3} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
