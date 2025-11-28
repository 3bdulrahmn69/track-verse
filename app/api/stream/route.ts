import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET(request: NextRequest) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (!request.signal.aborted) {
          const message = await redis.lpop('events');
          if (message) {
            controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error in stream:', error);
      } finally {
        controller.close();
      }
    },
    cancel() {
      // cleanup if needed
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
