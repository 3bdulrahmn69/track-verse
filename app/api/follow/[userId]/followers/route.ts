import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFollows, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = params;

    // Get followers (users who follow this user with accepted status)
    const followers = await db
      .select({
        id: users.id,
        name: users.fullname,
        username: users.username,
        image: users.image,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(
        and(
          eq(userFollows.followingId, userId),
          eq(userFollows.status, 'accepted')
        )
      );

    return NextResponse.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
}
