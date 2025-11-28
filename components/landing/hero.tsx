import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  MdMovie,
  MdOndemandVideo,
  MdLibraryBooks,
  MdVideogameAsset,
} from 'react-icons/md';

export default function Hero() {
  return (
    <section className="min-h-screen bg-background flex items-center px-4 py-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
              Track Verse
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 text-primary">
              Your Ultimate Media Tracking Experience
            </p>
            <p className="text-lg mb-10 text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Track Verse is a comprehensive media tracking and social platform
              that allows users to track, review, and share their consumption of
              movies, TV shows, books, and video games in one unified dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Start Tracking
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Enhanced Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative max-w-lg w-full">
              {/* Background Elements */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                <div
                  className="absolute bottom-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
              </div>

              {/* Main Content */}
              <div className="text-center">
                {/* Media Types Grid */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <MdMovie className="text-4xl text-primary" />
                    </div>
                    <span className="font-semibold text-foreground mb-1">
                      Movies
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Track & Review
                    </span>
                  </div>

                  <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="bg-accent/10 p-4 rounded-full mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                      <MdOndemandVideo className="text-4xl text-accent" />
                    </div>
                    <span className="font-semibold text-foreground mb-1">
                      TV Shows
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Episode Progress
                    </span>
                  </div>

                  <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-secondary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="bg-secondary/10 p-4 rounded-full mb-4 group-hover:bg-secondary/20 transition-colors duration-300">
                      <MdLibraryBooks className="text-4xl text-secondary" />
                    </div>
                    <span className="font-semibold text-foreground mb-1">
                      Books
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Reading Journey
                    </span>
                  </div>

                  <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-info/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="bg-info/10 p-4 rounded-full mb-4 group-hover:bg-info/20 transition-colors duration-300">
                      <MdVideogameAsset className="text-4xl text-info" />
                    </div>
                    <span className="font-semibold text-foreground mb-1">
                      Games
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Gaming Stats
                    </span>
                  </div>
                </div>

                {/* Bottom Stats or Callout */}
                <div className="bg-linear-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-6 border border-border/30">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Join thousands of users discovering, tracking, and sharing
                    their favorite entertainment across all platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
