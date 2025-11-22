import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFollows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = params;

    // Get follower count (users who follow this user with accepted status)
    const followers = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followingId, userId),
          eq(userFollows.status, 'accepted')
        )
      );

    // Get following count (users this user follows with accepted status)
    const following = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, userId),
          eq(userFollows.status, 'accepted')
        )
      );

    return NextResponse.json({
      followerCount: followers.length,
      followingCount: following.length,
    });
  } catch (error) {
    console.error('Error fetching follow stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow stats' },
      { status: 500 }
    );
  }
}
