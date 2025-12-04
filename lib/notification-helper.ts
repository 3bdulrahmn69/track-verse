import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Notify a user that they have a new notification
 * Stores notification ID in Redis queue for SSE to pick up
 */
export async function notifyUser(
  userId: string,
  notificationId?: string
): Promise<void> {
  try {
    const key = `notifications:${userId}:pending`;
    const timestamp = Date.now();

    // Push notification event to list (queue)
    await redis.lpush(
      key,
      JSON.stringify({
        timestamp,
        notificationId,
        action: notificationId ? 'new' : 'update',
      })
    );

    // Set expiration on the list (refresh TTL on each push)
    await redis.expire(key, 3600); // 1 hour expiration
  } catch (error) {
    console.error('Error notifying user:', error);
    // Don't throw - notification delivery is not critical
  }
}
