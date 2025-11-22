import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userTvShows } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getTVShowDetails } from '@/lib/tmdb';

// GET - Fetch user's TV shows
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('User ID:', userId);

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let whereClause = eq(userTvShows.userId, userId);

    // Apply status filter if provided
    if (statusFilter) {
      const statuses = statusFilter.split(',').filter(Boolean);
      if (statuses.length === 1) {
        whereClause = and(
          eq(userTvShows.userId, userId),
          eq(
            userTvShows.status,
            statuses[0] as
              | 'want_to_watch'
              | 'watching'
              | 'completed'
              | 'stopped_watching'
          )
        )!;
      } else if (statuses.length > 1) {
        whereClause = and(
          eq(userTvShows.userId, userId),
          inArray(
            userTvShows.status,
            statuses as (
              | 'want_to_watch'
              | 'watching'
              | 'completed'
              | 'stopped_watching'
            )[]
          )
        )!;
      }
    }

    const shows = await db.query.userTvShows.findMany({
      where: whereClause,
      orderBy: (userTvShows, { desc }) => [desc(userTvShows.updatedAt)],
    });

    // Map to TVShow format
    const tvShows = shows.map((show) => ({
      id: show.tvShowId,
      name: show.tvShowName,
      poster_path: show.tvShowPosterPath,
      first_air_date: show.tvShowFirstAirDate,
      vote_average: show.tmdbRating || 0,
      status: show.status,
      watchedEpisodes: show.watchedEpisodes,
      totalEpisodes: show.totalEpisodes,
      addedAt: show.createdAt,
      overview: '', // Add if needed
      original_name: show.tvShowName,
      backdrop_path: null,
      vote_count: 0,
      popularity: 0,
      genre_ids: [],
      origin_country: [],
      original_language: '',
    }));

    return NextResponse.json({ shows: tvShows });
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV shows' },
      { status: 500 }
    );
  }
}

// POST - Add or update a TV show
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tvShowId,
      tvShowName,
      tvShowPosterPath,
      tvShowFirstAirDate,
      status,
    } = body;

    // Fetch TV show details from TMDB to get total seasons and episodes
    let totalSeasons = 0;
    let totalEpisodes = 0;
    let tmdbRating = 0;

    try {
      const tvShowDetails = await getTVShowDetails(tvShowId);
      totalSeasons = tvShowDetails.number_of_seasons;
      totalEpisodes = tvShowDetails.number_of_episodes;
      tmdbRating = Math.round(tvShowDetails.vote_average);
    } catch (error) {
      console.error('Error fetching TV show details:', error);
    }

    // Check if TV show already exists for user
    const existingShow = await db.query.userTvShows.findFirst({
      where: and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.tvShowId, tvShowId)
      ),
    });

    if (existingShow) {
      // Update existing TV show
      await db
        .update(userTvShows)
        .set({
          status,
          tmdbRating,
          totalSeasons,
          totalEpisodes,
          updatedAt: new Date(),
        })
        .where(eq(userTvShows.id, existingShow.id));

      return NextResponse.json({
        message: 'TV show updated successfully',
        tvShow: existingShow,
      });
    } else {
      // Insert new TV show
      const [newShow] = await db
        .insert(userTvShows)
        .values({
          userId: session.user.id,
          tvShowId,
          tvShowName,
          tvShowPosterPath,
          tvShowFirstAirDate,
          status,
          tmdbRating,
          totalSeasons,
          totalEpisodes,
          watchedEpisodes: 0,
        })
        .returning();

      return NextResponse.json({
        message: 'TV show added successfully',
        tvShow: newShow,
      });
    }
  } catch (error) {
    console.error('Error adding/updating TV show:', error);
    return NextResponse.json(
      { error: 'Failed to add/update TV show' },
      { status: 500 }
    );
  }
}
