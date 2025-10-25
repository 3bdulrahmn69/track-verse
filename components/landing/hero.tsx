import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  MdMovie,
  MdHome,
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
              Everything, Everywhere, All at Once
            </p>
            <p className="text-lg mb-10 text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Enter a gamified universe where tracking your world becomes an
              epic adventure. From movies to habits, organize your life in
              immersive 3D spaces.
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

          {/* Right Side - Visual Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
                Explore Your Worlds
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-3">
                    <MdMovie className="text-3xl text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Cinema</span>
                  <span className="text-sm text-muted-foreground">
                    Movies & Series
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-3">
                    <MdHome className="text-3xl text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Home</span>
                  <span className="text-sm text-muted-foreground">
                    Daily Life
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-3">
                    <MdLibraryBooks className="text-3xl text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Library</span>
                  <span className="text-sm text-muted-foreground">
                    Books & Reading
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-3">
                    <MdVideogameAsset className="text-3xl text-primary" />
                  </div>
                  <span className="font-medium text-foreground">CyberCafe</span>
                  <span className="text-sm text-muted-foreground">
                    Video Games
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-center text-muted-foreground text-sm">
                  And more areas coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
