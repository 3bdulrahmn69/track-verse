import { FiUserX } from 'react-icons/fi';
import BackButton from '@/components/shared/back-button';

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <FiUserX className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">
          User Not Found
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The user you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        <BackButton />
      </div>
    </div>
  );
}
