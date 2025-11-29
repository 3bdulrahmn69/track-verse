import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Notify a user that they have a new notification
 * Stores notification ID in Redis for SSE to pick up
 */
export async function notifyUser(
  userId: string,
  notificationId?: string
): Promise<void> {
  try {
    const key = `notifications:${userId}:pending`;
    const timestamp = Date.now();

    // Store notification event with timestamp
    await redis.setex(
      key,
      3600, // 1 hour expiration
      JSON.stringify({
        timestamp,
        notificationId,
        action: notificationId ? 'new' : 'update',
      })
    );
  } catch (error) {
    console.error('Error notifying user:', error);
    // Don't throw - notification delivery is not critical
  }
}
