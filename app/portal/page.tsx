import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

export default async function PortalPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Track Verse, {session.user?.name}!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          This is your dashboard. Start tracking your favorite movies, TV shows,
          games, books, and more.
        </p>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {session.user?.name}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p>
              <strong>Username:</strong> {session.user?.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
