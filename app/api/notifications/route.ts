import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { notifications, users, userFollows } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notifyUser } from '@/lib/notification-helper';

// GET /api/notifications - Get all notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Fetch notifications with user details
    const query = db
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
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt));

    const allNotifications = await query;

    // Filter unread if requested
    const filteredNotifications = unreadOnly
      ? allNotifications.filter((n) => !n.read)
      : allNotifications;

    // For follow requests, get the follow status
    const notificationsWithStatus = await Promise.all(
      filteredNotifications.map(async (notification) => {
        if (notification.type === 'follow_request' && notification.followId) {
          const [follow] = await db
            .select()
            .from(userFollows)
            .where(eq(userFollows.id, notification.followId))
            .limit(1);

          return {
            ...notification,
            followStatus: follow?.status || null,
          };
        }
        return notification;
      })
    );

    // Count unread notifications
    const unreadCount = allNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: notificationsWithStatus,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    // Mark notifications as read
    for (const id of notificationIds) {
      await db.update(notifications).set({ read: true }).where(
        eq(notifications.id, id)
        // Ensure the notification belongs to the current user
      );
    }

    // Notify user via SSE to update UI
    await notifyUser(session.user.id);

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Delete notification from database
    await db.delete(notifications).where(eq(notifications.id, notificationId));

    // Notify user via SSE to remove from UI
    await notifyUser(session.user.id, notificationId);

    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
