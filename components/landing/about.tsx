import {
  MdTrackChanges,
  MdDashboard,
  MdGroup,
  MdExpandMore,
} from 'react-icons/md';
import { Container } from '../layout/container';

const highlights = [
  {
    icon: MdTrackChanges,
    title: 'Unified Tracking',
    description:
      'One platform for all your entertainment and personal tracking needs.',
  },
  {
    icon: MdDashboard,
    title: 'Intuitive Dashboard',
    description:
      'Clean, organized interface that makes tracking simple and enjoyable.',
  },
  {
    icon: MdGroup,
    title: 'Growing Community',
    description:
      'Join trackers who embrace "Everything, Everywhere, All at once."',
  },
  {
    icon: MdExpandMore,
    title: 'Scalable Design',
    description:
      'Add new tracking categories as your interests and hobbies expand.',
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-24 px-4 bg-linear-to-br from-background via-card/20 to-background relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-16 left-16 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <Container>
        {/* Main heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Why Track Verse?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of media tracking with our comprehensive
            dashboard that makes organization simple and effective.
          </p>
        </div>

        {/* Hero content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Beyond Traditional Tracking
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In a world overflowing with content and activities, keeping
                track of what you&apos;ve experienced can be overwhelming. Track
                Verse provides a clean, organized platform where tracking feels
                effortless and enjoyable.
              </p>
            </div>

            <div className="bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Clean & Organized
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Unlike cluttered traditional apps, Track Verse provides a clean
                dashboard. Navigate through Cinema, Home, Library, and CyberCafe
                to manage movies, series, books, and games—all in one place.
              </p>
            </div>
          </div>

          {/* Visual element */}
          <div className="relative">
            <div className="bg-linear-to-br from-card to-muted rounded-3xl p-8 shadow-2xl border border-border/50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-primary to-accent rounded-full mb-6 shadow-lg">
                  <MdTrackChanges className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Your Tracking Hub
                </h3>
                <p className="text-muted-foreground mb-6">
                  Explore virtual spaces designed for every aspect of your life
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-background/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-primary">4</div>
                    <div className="text-sm text-muted-foreground">
                      Core Areas
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-accent">∞</div>
                    <div className="text-sm text-muted-foreground">
                      Expandable
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-bounce" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent/20 rounded-full blur-lg animate-pulse" />
          </div>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <div
                key={index}
                className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-primary/20 to-accent/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {highlight.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
