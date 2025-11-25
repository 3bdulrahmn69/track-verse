import Link from 'next/link';
import { FiArrowLeft, FiMonitor } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function TVShowNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FiMonitor className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          TV Show Not Found
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The TV show you&apos;re looking for doesn&apos;t exist or may have
          been removed. Please check the URL or browse our collection of TV
          shows.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/portal?tab=tv-shows">
            <Button>
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
