import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userMovies, userFollows, users } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

// GET /api/feed/movies - Get movie activities from followed users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get list of users the current user is following (accepted follows only)
    const followedUsers = await db
      .select({ userId: userFollows.followingId })
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.status, 'accepted')
        )
      );

    if (followedUsers.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    const followedUserIds = followedUsers.map((f) => f.userId);

    // Get recent movie activities from followed users
    const activities = await db
      .select({
        id: userMovies.id,
        movieId: userMovies.movieId,
        movieTitle: userMovies.movieTitle,
        moviePosterPath: userMovies.moviePosterPath,
        movieReleaseDate: userMovies.movieReleaseDate,
        status: userMovies.status,
        watchCount: userMovies.watchCount,
        createdAt: userMovies.createdAt,
        updatedAt: userMovies.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          fullname: users.fullname,
          image: users.image,
        },
      })
      .from(userMovies)
      .innerJoin(users, eq(userMovies.userId, users.id))
      .where(inArray(userMovies.userId, followedUserIds))
      .orderBy(desc(userMovies.updatedAt))
      .limit(50); // Limit to 50 most recent activities

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching movie feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie feed' },
      { status: 500 }
    );
  }
}
