import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userMovies, users } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Get all comments/reviews for a specific movie
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    // Fetch all user reviews for this movie (only those with ratings/comments)
    const reviews = await db
      .select({
        id: userMovies.id,
        userId: userMovies.userId,
        userName: users.fullname,
        username: users.username,
        userImage: users.image,
        userRating: userMovies.userRating,
        userComment: userMovies.userComment,
        createdAt: userMovies.createdAt,
      })
      .from(userMovies)
      .leftJoin(users, eq(userMovies.userId, users.id))
      .where(
        and(eq(userMovies.movieId, movieId), isNotNull(userMovies.userRating))
      )
      .orderBy(userMovies.createdAt);

    const comments = reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      userName: review.userName || 'Anonymous',
      username: review.username || 'anonymous',
      userImage: review.userImage,
      userRating: review.userRating || 0,
      userComment: review.userComment || '',
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching movie comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// PATCH - Update a review
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const movieId = parseInt(id);
    const body = await request.json();
    const { commentId, userRating, userComment } = body;

    if (!commentId || !userRating) {
      return NextResponse.json(
        { error: 'Comment ID and rating are required' },
        { status: 400 }
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
          eq(userMovies.id, commentId),
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, movieId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Review updated successfully', review: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const movieId = parseInt(id);

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body is empty or invalid JSON
    }

    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Delete the review (set rating and comment to null)
    const updated = await db
      .update(userMovies)
      .set({
        userRating: null,
        userComment: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userMovies.id, commentId),
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, movieId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
