import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userMovies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST - Increment watch count (rewatch movie)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Check if movie exists for this user
    const existingMovie = await db
      .select()
      .from(userMovies)
      .where(
        and(
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, movieId)
        )
      );

    if (existingMovie.length === 0) {
      return NextResponse.json(
        { error: 'Movie not found in user library' },
        { status: 404 }
      );
    }

    // Increment watch count
    const updated = await db
      .update(userMovies)
      .set({
        watchCount: (existingMovie[0].watchCount || 0) + 1,
        status: 'watched', // Ensure status is watched
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, movieId)
        )
      )
      .returning();

    return NextResponse.json(
      { message: 'Watch count incremented', movie: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error incrementing watch count:', error);
    return NextResponse.json(
      { error: 'Failed to increment watch count' },
      { status: 500 }
    );
  }
}
