import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userFollows, notifications, users } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { Redis } from '@upstash/redis';

// POST /api/follow - Send a follow request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // Can't follow yourself
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You can't follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists and get their privacy setting
    const [targetUser] = await db
      .select({
        id: users.id,
        isPublic: users.isPublic,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if follow relationship already exists
    const existingFollow = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.followingId, targetUserId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      const follow = existingFollow[0];
      if (follow.status === 'pending') {
        return NextResponse.json(
          { error: 'Follow request already sent' },
          { status: 400 }
        );
      }
      if (follow.status === 'accepted') {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 400 }
        );
      }
      // If rejected, update status to pending
      const [updatedFollow] = await db
        .update(userFollows)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(eq(userFollows.id, follow.id))
        .returning();

      // Create notification
      const inserted = await db
        .insert(notifications)
        .values({
          userId: targetUserId,
          fromUserId: session.user.id,
          type: 'follow_request',
          followId: updatedFollow.id,
        })
        .returning();

      // Get full notification data
      const [fullNotification] = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          read: notifications.read,
          createdAt: notifications.createdAt,
          followId: notifications.followId,
          fromUser: {
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            image: users.image,
          },
        })
        .from(notifications)
        .innerJoin(users, eq(notifications.fromUserId, users.id))
        .where(eq(notifications.id, inserted[0].id));

      let followStatus = null;
      if (
        fullNotification.type === 'follow_request' &&
        fullNotification.followId
      ) {
        const [follow] = await db
          .select({ status: userFollows.status })
          .from(userFollows)
          .where(eq(userFollows.id, fullNotification.followId))
          .limit(1);
        followStatus = follow?.status || null;
      }

      // Publish to SSE
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      await redis.lpush(
        'events',
        JSON.stringify({
          type: 'notification',
          action: 'add',
          payload: { ...fullNotification, followStatus },
        })
      );

      // If rejected, update status to pending
      const [resendFollow] = await db
        .update(userFollows)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(eq(userFollows.id, follow.id))
        .returning();

      // Create notification
      const inserted2 = await db
        .insert(notifications)
        .values({
          userId: targetUserId,
          fromUserId: session.user.id,
          type: 'follow_request',
          followId: resendFollow.id,
        })
        .returning();

      // Get full notification data
      const [fullNotification2] = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          read: notifications.read,
          createdAt: notifications.createdAt,
          followId: notifications.followId,
          fromUser: {
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            image: users.image,
          },
        })
        .from(notifications)
        .innerJoin(users, eq(notifications.fromUserId, users.id))
        .where(eq(notifications.id, inserted2[0].id));

      let followStatus2 = null;
      if (
        fullNotification2.type === 'follow_request' &&
        fullNotification2.followId
      ) {
        const [follow] = await db
          .select({ status: userFollows.status })
          .from(userFollows)
          .where(eq(userFollows.id, fullNotification2.followId))
          .limit(1);
        followStatus2 = follow?.status || null;
      }

      // Publish to SSE
      const redis2 = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      await redis2.lpush(
        'events',
        JSON.stringify({
          type: 'notification',
          action: 'add',
          payload: { ...fullNotification2, followStatus: followStatus2 },
        })
      );

      return NextResponse.json({
        message: 'Follow request sent',
        follow: resendFollow,
      });
    }

    // Create new follow request - auto-accept if target user is public
    const followStatus = targetUser.isPublic ? 'accepted' : 'pending';
    const notificationType = targetUser.isPublic ? 'follow' : 'follow_request';

    const [newFollow] = await db
      .insert(userFollows)
      .values({
        followerId: session.user.id,
        followingId: targetUserId,
        status: followStatus,
      })
      .returning();

    // Create notification for the target user
    const inserted3 = await db
      .insert(notifications)
      .values({
        userId: targetUserId,
        fromUserId: session.user.id,
        type: notificationType,
        followId: newFollow.id,
      })
      .returning();

    // Get full notification data
    const [fullNotification3] = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        read: notifications.read,
        createdAt: notifications.createdAt,
        followId: notifications.followId,
        fromUser: {
          id: users.id,
          username: users.username,
          fullname: users.fullname,
          image: users.image,
        },
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.fromUserId, users.id))
      .where(eq(notifications.id, inserted3[0].id));

    let followStatus3 = null;
    if (
      fullNotification3.type === 'follow_request' &&
      fullNotification3.followId
    ) {
      const [follow] = await db
        .select({ status: userFollows.status })
        .from(userFollows)
        .where(eq(userFollows.id, fullNotification3.followId))
        .limit(1);
      followStatus3 = follow?.status || null;
    }

    // Publish to SSE
    const redis3 = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis3.lpush(
      'events',
      JSON.stringify({
        type: 'notification',
        action: 'add',
        payload: { ...fullNotification3, followStatus: followStatus3 },
      })
    );

    const message = targetUser.isPublic
      ? 'Successfully followed user'
      : 'Follow request sent';

    return NextResponse.json({
      message,
      follow: newFollow,
    });
  } catch (error) {
    console.error('Error sending follow request:', error);
    return NextResponse.json(
      { error: 'Failed to send follow request' },
      { status: 500 }
    );
  }
}

// GET /api/follow - Get follow status with a specific user or all follows
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (targetUserId) {
      // Get follow status with specific user
      const [followingStatus] = await db
        .select()
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, session.user.id),
            eq(userFollows.followingId, targetUserId)
          )
        )
        .limit(1);

      const [followerStatus] = await db
        .select()
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, targetUserId),
            eq(userFollows.followingId, session.user.id)
          )
        )
        .limit(1);

      return NextResponse.json({
        isFollowing: followingStatus?.status === 'accepted',
        followRequestSent: followingStatus?.status === 'pending',
        isFollower: followerStatus?.status === 'accepted',
        hasFollowRequest: followerStatus?.status === 'pending',
      });
    }

    // Get all follows (following and followers)
    const following = await db
      .select({
        id: userFollows.id,
        userId: users.id,
        username: users.username,
        fullname: users.fullname,
        image: users.image,
        status: userFollows.status,
        createdAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followingId, users.id))
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.status, 'accepted')
        )
      );

    const followers = await db
      .select({
        id: userFollows.id,
        userId: users.id,
        username: users.username,
        fullname: users.fullname,
        image: users.image,
        status: userFollows.status,
        createdAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(
        and(
          eq(userFollows.followingId, session.user.id),
          eq(userFollows.status, 'accepted')
        )
      );

    return NextResponse.json({ following, followers });
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}

// DELETE /api/follow - Unfollow a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // Delete follow relationship
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.followingId, targetUserId)
        )
      );

    // Get the notification id before deleting
    const [notificationToDelete] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, targetUserId),
          eq(notifications.fromUserId, session.user.id),
          or(
            eq(notifications.type, 'follow_request'),
            eq(notifications.type, 'follow')
          )
        )
      )
      .limit(1);

    // Delete the follow request notification
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, targetUserId),
          eq(notifications.fromUserId, session.user.id),
          or(
            eq(notifications.type, 'follow_request'),
            eq(notifications.type, 'follow')
          )
        )
      );

    // Publish to SSE for the target user
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    if (notificationToDelete) {
      await redis.lpush(
        'events',
        JSON.stringify({
          type: 'notification',
          action: 'delete',
          payload: { id: notificationToDelete.id },
        })
      );
    }

    return NextResponse.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
