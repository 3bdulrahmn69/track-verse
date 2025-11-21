import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userTvShows, userEpisodes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get status of a specific TV show
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tvShowId = parseInt(id);

    if (isNaN(tvShowId)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID' },
        { status: 400 }
      );
    }

    const show = await db.query.userTvShows.findFirst({
      where: and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.tvShowId, tvShowId)
      ),
    });

    return NextResponse.json({
      status: show?.status || null,
      watchedEpisodes: show?.watchedEpisodes || 0,
      totalEpisodes: show?.totalEpisodes || 0,
    });
  } catch (error) {
    console.error('Error fetching TV show status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV show status' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a TV show from user's list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tvShowId = parseInt(id);

    if (isNaN(tvShowId)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID' },
        { status: 400 }
      );
    }

    // Find the user's TV show record
    const show = await db.query.userTvShows.findFirst({
      where: and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.tvShowId, tvShowId)
      ),
    });

    if (!show) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Delete all episodes for this show (cascade will handle this, but being explicit)
    await db.delete(userEpisodes).where(eq(userEpisodes.userTvShowId, show.id));

    // Delete the TV show
    await db.delete(userTvShows).where(eq(userTvShows.id, show.id));

    return NextResponse.json({
      message: 'TV show removed successfully',
    });
  } catch (error) {
    console.error('Error deleting TV show:', error);
    return NextResponse.json(
      { error: 'Failed to delete TV show' },
      { status: 500 }
    );
  }
}
