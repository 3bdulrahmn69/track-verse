import { Container } from '../layout/container';
import { MdMovie, MdVideogameAsset, MdLibraryBooks } from 'react-icons/md';

const services = [
  {
    name: 'TMDB',
    description:
      'The Movie Database provides comprehensive movie and TV show data including ratings, cast, crew, and detailed information.',
    icon: MdMovie,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    name: 'Open Library',
    description:
      'Open Library provides access to millions of book records, author information, and reading data.',
    icon: MdLibraryBooks,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    name: 'RAWG',
    description:
      'RAWG Video Games Database offers extensive game information, ratings, screenshots, and platform details.',
    icon: MdVideogameAsset,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export default function APIServices() {
  return (
    <section
      id="apis"
      className="py-24 px-4 bg-linear-to-br from-muted/20 via-background to-muted/20 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <Container className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Powered by Industry-Leading APIs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track Verse integrates with the best entertainment data sources to
            provide you with accurate, up-to-date information for all your
            favorite movies, shows, books, and games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`shrink-0 w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`w-6 h-6 ${service.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            All data is fetched in real-time to ensure you always have the most
            current information available.
          </p>
        </div>
      </Container>
    </section>
  );
}
