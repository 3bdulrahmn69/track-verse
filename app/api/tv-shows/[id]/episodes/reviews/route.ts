import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userEpisodes, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// GET - Get all reviews for a specific episode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tvShowId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const seasonNumber = parseInt(searchParams.get('seasonNumber') || '1');
    const episodeNumber = parseInt(searchParams.get('episodeNumber') || '1');

    if (isNaN(tvShowId) || isNaN(seasonNumber) || isNaN(episodeNumber)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID, season number, or episode number' },
        { status: 400 }
      );
    }

    // Reviews are public - no need to check if user has the show in their list
    // Get all reviews for this episode
    const episodeReviews = await db
      .select({
        id: userEpisodes.id,
        userId: userEpisodes.userId,
        userRating: userEpisodes.userRating,
        userComment: userEpisodes.userComment,
        watchedAt: userEpisodes.watchedAt,
        createdAt: userEpisodes.createdAt,
        updatedAt: userEpisodes.updatedAt,
      })
      .from(userEpisodes)
      .where(
        and(
          eq(userEpisodes.tvShowId, tvShowId),
          eq(userEpisodes.seasonNumber, seasonNumber),
          eq(userEpisodes.episodeNumber, episodeNumber),
          eq(userEpisodes.watched, true)
        )
      );

    // Get user data for the reviews
    const userIds = episodeReviews.map((review) => review.userId);
    const userData =
      userIds.length > 0
        ? await db
            .select({
              id: users.id,
              name: users.fullname,
              username: users.username,
              image: users.image,
            })
            .from(users)
            .where(inArray(users.id, userIds))
        : [];

    // Create a map of user data
    const userMap = new Map(userData.map((user) => [user.id, user]));

    // Filter out reviews without ratings or comments and format the response
    const reviewsWithContent = episodeReviews
      .filter((review) => review.userRating || review.userComment)
      .map((review) => {
        const user = userMap.get(review.userId);
        return {
          id: review.id,
          userId: review.userId,
          userRating: review.userRating,
          userComment: review.userComment,
          watchedAt: review.watchedAt,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: {
            name: user?.name || 'Anonymous',
            username: user?.username,
            image: user?.image,
          },
        };
      });

    return NextResponse.json({ reviews: reviewsWithContent });
  } catch (error) {
    console.error('Error fetching episode reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode reviews' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user's review for a specific episode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tvShowId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const seasonNumber = parseInt(searchParams.get('seasonNumber') || '1');
    const episodeNumber = parseInt(searchParams.get('episodeNumber') || '1');

    if (isNaN(tvShowId) || isNaN(seasonNumber) || isNaN(episodeNumber)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID, season number, or episode number' },
        { status: 400 }
      );
    }

    // Delete the user's review for this episode
    await db
      .delete(userEpisodes)
      .where(
        and(
          eq(userEpisodes.userId, session.user.id),
          eq(userEpisodes.tvShowId, tvShowId),
          eq(userEpisodes.seasonNumber, seasonNumber),
          eq(userEpisodes.episodeNumber, episodeNumber)
        )
      );

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
