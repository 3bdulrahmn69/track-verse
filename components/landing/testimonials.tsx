import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { Container } from '../layout/container';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      'Track Verse has completely transformed how I organize my movie collection. The clean interface makes browsing my watched films so easy and enjoyable!',
    author: 'Alex Johnson',
    role: 'Film Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    quote:
      "As a hardcore gamer, I love how Track Verse lets me track my gaming achievements in a comprehensive dashboard. Finally, a gaming tracker that's both powerful and easy to use!",
    author: 'Sam Lee',
    role: 'Gaming Pro',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    quote:
      'My bookshelf just got a whole new level of organization! Track Verse makes organizing my reading list and tracking my progress through books absolutely delightful.',
    author: 'Jordan Kim',
    role: 'Book Lover',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    quote:
      'Binge-watching has never been this organized. Track Verse helps me keep track of all my favorite series across different platforms in one beautiful dashboard.',
    author: 'Taylor Brown',
    role: 'Series Addict',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    quote:
      'The perfect blend of functionality and fun! Track Verse makes tracking my media consumption across movies, games, books, and series an enjoyable experience.',
    author: 'Morgan Davis',
    role: 'Media Collector',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    quote:
      "From epic game marathons to movie nights and book clubs, Track Verse keeps everything organized in a way that's as entertaining as the media itself!",
    author: 'Casey Wilson',
    role: 'Entertainment Fan',
    avatar: 'https://i.pravatar.cc/150?img=6',
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
      <Container>
        {/* First Row: Right to Left */}
        <div className="overflow-hidden mb-8 fade-edges">
          <Marquee direction="left" speed={60} gradient={false}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialsCard
                key={`row1-${index}`}
                testimonial={testimonial}
              />
            ))}
          </Marquee>
        </div>

        {/* Second Row: Left to Right */}
        <div className="overflow-hidden fade-edges">
          <Marquee direction="right" speed={60} gradient={false}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialsCard
                key={`row2-${index}`}
                testimonial={testimonial}
              />
            ))}
          </Marquee>
        </div>
      </Container>
    </section>
  );
}
