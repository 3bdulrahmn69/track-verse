import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userGames } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get user's games by status
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
    const gameId = searchParams.get('gameId');

    // If gameId is provided, return specific game
    if (gameId) {
      const games = await db
        .select()
        .from(userGames)
        .where(
          and(
            eq(userGames.userId, session.user.id),
            eq(userGames.gameId, parseInt(gameId))
          )
        );
      return NextResponse.json({ games }, { status: 200 });
    }

    // Otherwise return all games or filtered by status
    let games;
    if (status) {
      games = await db
        .select()
        .from(userGames)
        .where(
          and(
            eq(userGames.userId, session.user.id),
            eq(userGames.status, status)
          )
        );
    } else {
      games = await db
        .select()
        .from(userGames)
        .where(eq(userGames.userId, session.user.id));
    }

    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST - Add game to user's list
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      gameId,
      gameName,
      gameSlug,
      gameBackgroundImage,
      gameReleased,
      status,
      rating,
      avgPlaytime,
      metacritic,
    } = body;

    console.log('POST /api/games - Received data:', {
      gameId,
      gameName,
      status,
      rating,
      avgPlaytime,
      ratingType: typeof rating,
      ratingIsNull: rating === null,
    });

    if (!gameId || !gameName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if game already exists for this user
    const existingGame = await db
      .select()
      .from(userGames)
      .where(
        and(eq(userGames.userId, session.user.id), eq(userGames.gameId, gameId))
      );

    if (existingGame.length > 0) {
      // Update existing game status
      const updateData: {
        status: 'want_to_play' | 'playing' | 'completed';
        updatedAt: Date;
        rating?: string | null;
        avgPlaytime?: number | null;
      } = {
        status,
        updatedAt: new Date(),
      };

      // Explicitly set rating and avgPlaytime (only if not null for rating)
      if (rating !== undefined && rating !== null) {
        updateData.rating = rating ? Number(rating).toString() : null;
      }
      if (avgPlaytime !== undefined) {
        updateData.avgPlaytime = avgPlaytime;
      }

      await db
        .update(userGames)
        .set(updateData)
        .where(eq(userGames.id, existingGame[0].id));

      return NextResponse.json(
        {
          message: 'Game status updated',
          game: { ...existingGame[0], ...updateData },
        },
        { status: 200 }
      );
    } else {
      // Insert new game
      const newGame = await db
        .insert(userGames)
        .values({
          userId: session.user.id,
          gameId,
          gameName,
          gameSlug,
          gameBackgroundImage,
          gameReleased,
          status,
          rating: rating ? Number(rating).toString() : null,
          avgPlaytime: avgPlaytime || null,
          metacritic,
        })
        .returning();

      return NextResponse.json(
        { message: 'Game added', game: newGame[0] },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error adding/updating game:', error);
    return NextResponse.json(
      { error: 'Failed to add/update game' },
      { status: 500 }
    );
  }
}

// DELETE - Remove game from user's list
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    await db
      .delete(userGames)
      .where(
        and(
          eq(userGames.userId, session.user.id),
          eq(userGames.gameId, parseInt(gameId))
        )
      );

    return NextResponse.json({ message: 'Game removed' }, { status: 200 });
  } catch (error) {
    console.error('Error removing game:', error);
    return NextResponse.json(
      { error: 'Failed to remove game' },
      { status: 500 }
    );
  }
}
