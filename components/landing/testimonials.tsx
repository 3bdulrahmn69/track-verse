import Image from 'next/image';
import Marquee from 'react-fast-marquee';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      'As a media enthusiast tracking over 200 movies, 50 TV shows, countless books, and dozens of games, Track Verse has become my ultimate entertainment hub. The detailed statistics and social features keep me engaged daily!',
    author: 'Alex Rivera',
    role: 'Media Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    quote:
      'Track Verse makes media tracking simple and enjoyable. I easily keep track of my favorite movies and shows without it feeling overwhelming. Perfect for casual entertainment lovers like me!',
    author: 'Jordan Chen',
    role: 'Casual User',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    quote:
      'The social features in Track Verse are incredible! Following friends and seeing their activity feeds has introduced me to amazing movies, books, and games I never would have discovered otherwise.',
    author: 'Taylor Morgan',
    role: 'Social Connector',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    quote:
      'Track Verse respects my privacy while helping me maintain a perfectly organized personal media library. The private profile features give me full control over what I share and what stays personal.',
    author: 'Casey Williams',
    role: 'Private Tracker',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    quote:
      'The unified platform approach is brilliant! Having all my movies, TV shows, books, and games in one place with rich metadata and seamless tracking has transformed how I manage my entertainment collection.',
    author: 'Morgan Davis',
    role: 'Content Creator',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    quote:
      'Real-time notifications and activity feeds keep me connected with fellow entertainment enthusiasts. Track Verse has built a community around shared interests that makes tracking media even more enjoyable!',
    author: 'Sam Rodriguez',
    role: 'Community Member',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    quote:
      'The episode tracking for TV shows is fantastic! I never lose track of where I left off in my favorite series. The detailed progress tracking makes binge-watching so much more organized.',
    author: 'Riley Thompson',
    role: 'TV Series Fan',
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    quote:
      'As a parent, Track Verse helps me keep track of family movie nights and shared reading experiences. The collaborative features make it perfect for family entertainment planning!',
    author: 'Jamie Parker',
    role: 'Family Organizer',
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
  {
    quote:
      'The gaming section is next-level! Detailed playtime tracking, achievement logging, and Metacritic integration help me discover and track my gaming journey like never before.',
    author: 'Avery Johnson',
    role: 'Gaming Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    quote:
      'Track Verse has revolutionized my reading habits. The reading progress tracker and note-taking features make every book journey memorable and well-documented.',
    author: 'Drew Martinez',
    role: 'Avid Reader',
    avatar: 'https://i.pravatar.cc/150?img=10',
  },
  {
    quote:
      'The API integrations with TMDB, RAWG, and Open Library mean I get rich, accurate information for everything I track. No more manual data entry - pure tracking bliss!',
    author: 'Cameron Lee',
    role: 'Tech-Savvy User',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    quote:
      "Whether I'm on my phone, tablet, or desktop, Track Verse works perfectly everywhere. The responsive design and cloud sync mean my entertainment data is always with me.",
    author: 'Patel Singh',
    role: 'Mobile User',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
];

const TestimonialsCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="bg-card p-5 rounded-lg shadow-md w-96 min-h-[200px] mx-3 my-1 flex flex-col text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center mb-4">
          <Image
            src={testimonial.avatar}
            alt={testimonial.author}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full mr-3 border-2 border-primary shrink-0"
          />
          <div>
            <p className="font-semibold text-sm">{testimonial.author}</p>
            <p className="text-muted-foreground text-xs">{testimonial.role}</p>
          </div>
        </div>
        <p className="text-primary text-6xl opacity-50">❝</p>
      </div>
      <p className="text-sm wrap-break-word italic leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&ldquo;
      </p>
    </div>
  );
};

export default function Testimonials() {
  // Duplicate for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="py-24 px-4 bg-linear-to-br from-background via-muted/30 to-background relative overflow-hidden"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          What Our Users Say
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Discover how Track Verse has transformed the way our community
          organizes and enjoys their entertainment journey.
        </p>
      </div>

      {/* First Row: Right to Left */}
      <div className="overflow-hidden mb-8 fade-edges">
        <Marquee direction="left" speed={60} gradient={false}>
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialsCard key={`row1-${index}`} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>

      {/* Second Row: Left to Right */}
      <div className="overflow-hidden fade-edges">
        <Marquee direction="right" speed={60} gradient={false}>
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialsCard key={`row2-${index}`} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
