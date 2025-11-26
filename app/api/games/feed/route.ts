import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userGames, userFollows, users } from '@/lib/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';

// GET - Get games from users that the current user follows
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'want_to_play'
      | 'playing'
      | 'completed'
      | null;

    // Get list of users the current user follows
    const following = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.status, 'accepted')
        )
      );

    if (following.length === 0) {
      return NextResponse.json({ games: [] }, { status: 200 });
    }

    const followingIds = following.map((f) => f.followingId);

    // Get games from followed users
    let games;
    if (status) {
      games = await db
        .select({
          id: userGames.id,
          gameId: userGames.gameId,
          gameName: userGames.gameName,
          gameSlug: userGames.gameSlug,
          gameBackgroundImage: userGames.gameBackgroundImage,
          gameReleased: userGames.gameReleased,
          status: userGames.status,
          rating: userGames.rating,
          avgPlaytime: userGames.avgPlaytime,
          metacritic: userGames.metacritic,
          createdAt: userGames.createdAt,
          updatedAt: userGames.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            image: users.image,
          },
        })
        .from(userGames)
        .leftJoin(users, eq(userGames.userId, users.id))
        .where(
          and(
            inArray(userGames.userId, followingIds),
            eq(userGames.status, status)
          )
        )
        .orderBy(desc(userGames.updatedAt))
        .limit(50);
    } else {
      games = await db
        .select({
          id: userGames.id,
          gameId: userGames.gameId,
          gameName: userGames.gameName,
          gameSlug: userGames.gameSlug,
          gameBackgroundImage: userGames.gameBackgroundImage,
          gameReleased: userGames.gameReleased,
          status: userGames.status,
          rating: userGames.rating,
          avgPlaytime: userGames.avgPlaytime,
          metacritic: userGames.metacritic,
          createdAt: userGames.createdAt,
          updatedAt: userGames.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            image: users.image,
          },
        })
        .from(userGames)
        .leftJoin(users, eq(userGames.userId, users.id))
        .where(inArray(userGames.userId, followingIds))
        .orderBy(desc(userGames.updatedAt))
        .limit(50);
    }

    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    console.error('Error fetching games feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games feed' },
      { status: 500 }
    );
  }
}
