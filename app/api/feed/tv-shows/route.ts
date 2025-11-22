import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userTvShows, userFollows, users } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

// GET /api/feed/tv-shows - Get TV show activities from followed users
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

    // Get recent TV show activities from followed users
    const activities = await db
      .select({
        id: userTvShows.id,
        tvShowId: userTvShows.tvShowId,
        tvShowName: userTvShows.tvShowName,
        tvShowPosterPath: userTvShows.tvShowPosterPath,
        tvShowFirstAirDate: userTvShows.tvShowFirstAirDate,
        status: userTvShows.status,
        totalSeasons: userTvShows.totalSeasons,
        totalEpisodes: userTvShows.totalEpisodes,
        watchedEpisodes: userTvShows.watchedEpisodes,
        createdAt: userTvShows.createdAt,
        updatedAt: userTvShows.updatedAt,
        userId: users.id,
        username: users.username,
        fullname: users.fullname,
        userImage: users.image,
      })
      .from(userTvShows)
      .innerJoin(users, eq(userTvShows.userId, users.id))
      .where(inArray(userTvShows.userId, followedUserIds))
      .orderBy(desc(userTvShows.updatedAt))
      .limit(50); // Limit to 50 most recent activities

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching TV show feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV show feed' },
      { status: 500 }
    );
  }
}
