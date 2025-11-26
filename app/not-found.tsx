import BackButton from '@/components/shared/back-button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Big 404 Text */}
        <div className="mb-6">
          <h2 className="text-8xl font-bold text-muted-foreground/30 select-none">
            404
          </h2>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        {/* Back Button */}
        <BackButton label="Go Back" variant="primary" size="md" />
      </div>
    </div>
  );
}
