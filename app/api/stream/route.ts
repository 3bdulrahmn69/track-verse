import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { notifications, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// SSE endpoint for real-time notifications
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const key = `notifications:${userId}:pending`;
      let lastCheckedTimestamp = 0;

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}

`
        )
      );

      const checkForUpdates = async () => {
        try {
          if (request.signal.aborted) {
            return false;
          }

          const pendingEvent = await redis.get<{
            timestamp: number;
            notificationId?: string;
            action: string;
          }>(key);

          if (pendingEvent && pendingEvent.timestamp !== lastCheckedTimestamp) {
            lastCheckedTimestamp = pendingEvent.timestamp;

            // If there's a notification ID, fetch the full notification
            if (pendingEvent.notificationId) {
              try {
                const [notification] = await db
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
                  .where(eq(notifications.id, pendingEvent.notificationId))
                  .limit(1);

                if (notification) {
                  // Send the full notification
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: 'notification',
                        action: 'new',
                        notification,
                      })}

`
                    )
                  );
                } else {
                  // Notification was deleted, send update signal
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: 'notification',
                        action: 'deleted',
                        notificationId: pendingEvent.notificationId,
                      })}

`
                    )
                  );
                }
              } catch (error) {
                console.error('Error fetching notification:', error);
                // Fallback to generic update
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'update',
                      timestamp: pendingEvent.timestamp,
                    })}

`
                  )
                );
              }
            } else {
              // Generic update (like delete action)
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'notification',
                    action: 'update',
                    timestamp: pendingEvent.timestamp,
                  })}

`
                )
              );
            }

            // Clear the pending event after processing
            await redis.del(key);
          }

          return true;
        } catch (error) {
          console.error('Error checking for updates:', error);
          return true; // Continue despite errors
        }
      };

      // Initial check
      await checkForUpdates();

      // Poll Redis every 2 seconds for updates
      const interval = setInterval(async () => {
        const shouldContinue = await checkForUpdates();
        if (!shouldContinue) {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
    cancel() {
      // Cleanup if needed
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}
