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

    // Get following (users this user follows with accepted status)
    const following = await db
      .select({
        id: users.id,
        name: users.fullname,
        username: users.username,
        image: users.image,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followingId, users.id))
      .where(
        and(
          eq(userFollows.followerId, userId),
          eq(userFollows.status, 'accepted')
        )
      );

    return NextResponse.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    );
  }
}
