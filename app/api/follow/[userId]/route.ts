import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userFollows, notifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/follow/[userId] - Accept or reject a follow request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: followerUserId } = await params;
    const { action } = await req.json();

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Find the follow request
    const [followRequest] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerUserId),
          eq(userFollows.followingId, session.user.id),
          eq(userFollows.status, 'pending')
        )
      )
      .limit(1);

    if (!followRequest) {
      return NextResponse.json(
        { error: 'Follow request not found' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      // Update follow status to accepted
      const [updatedFollow] = await db
        .update(userFollows)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(userFollows.id, followRequest.id))
        .returning();

      // Create notification for the follower
      await db.insert(notifications).values({
        userId: followerUserId,
        fromUserId: session.user.id,
        type: 'follow_accepted',
        followId: updatedFollow.id,
      });

      return NextResponse.json({
        message: 'Follow request accepted',
        follow: updatedFollow,
      });
    } else {
      // Update follow status to rejected
      const [updatedFollow] = await db
        .update(userFollows)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(userFollows.id, followRequest.id))
        .returning();

      return NextResponse.json({
        message: 'Follow request rejected',
        follow: updatedFollow,
      });
    }
  } catch (error) {
    console.error('Error handling follow request:', error);
    return NextResponse.json(
      { error: 'Failed to handle follow request' },
      { status: 500 }
    );
  }
}
