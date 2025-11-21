import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userTvShows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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
