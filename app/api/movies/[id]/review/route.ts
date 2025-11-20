import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userMovies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - Add or update review for a movie
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const movieId = parseInt(id);
    const body = await request.json();
    const { userRating, userComment } = body;

    if (!userRating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    // Check if user has this movie in their list
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
        { error: 'Movie not in your list. Please mark it as watched first.' },
        { status: 404 }
      );
    }

    // Update the review
    const updated = await db
      .update(userMovies)
      .set({
        userRating,
        userComment: userComment || null,
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
      { message: 'Review added successfully', review: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
