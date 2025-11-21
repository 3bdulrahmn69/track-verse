import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userEpisodes, userTvShows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSeasonDetails, getTVShowDetails } from '@/lib/tmdb';

// POST - Mark an episode as watched/unwatched
export async function POST(
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
    const body = await request.json();
    const { seasonNumber, episodeNumber, episodeName, watched } = body;

    // Find the user's TV show record
    let show = await db.query.userTvShows.findFirst({
      where: and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.tvShowId, tvShowId)
      ),
    });

    // If show doesn't exist and user is marking episode as watched, auto-add it with "watching" status
    if (!show && watched) {
      try {
        // Fetch TV show details from TMDB
        const tvShowDetails = await getTVShowDetails(tvShowId);

        // Insert new TV show with "watching" status
        const [newShow] = await db
          .insert(userTvShows)
          .values({
            userId: session.user.id,
            tvShowId,
            tvShowName: tvShowDetails.name,
            tvShowPosterPath: tvShowDetails.poster_path,
            tvShowFirstAirDate: tvShowDetails.first_air_date,
            status: 'watching',
            tmdbRating: Math.round(tvShowDetails.vote_average),
            totalSeasons: tvShowDetails.number_of_seasons,
            totalEpisodes: tvShowDetails.number_of_episodes,
            watchedEpisodes: 0,
          })
          .returning();

        show = newShow;
      } catch (error) {
        console.error('Error adding TV show:', error);
        return NextResponse.json(
          { error: 'Failed to add TV show' },
          { status: 500 }
        );
      }
    }

    if (!show) {
      return NextResponse.json(
        { error: 'TV show not found in your list' },
        { status: 404 }
      );
    }

    // Check if episode record exists
    const existingEpisode = await db.query.userEpisodes.findFirst({
      where: and(
        eq(userEpisodes.userId, session.user.id),
        eq(userEpisodes.userTvShowId, show.id),
        eq(userEpisodes.tvShowId, tvShowId),
        eq(userEpisodes.seasonNumber, seasonNumber),
        eq(userEpisodes.episodeNumber, episodeNumber)
      ),
    });

    if (existingEpisode) {
      // Update existing episode
      await db
        .update(userEpisodes)
        .set({
          watched,
          watchedAt: watched ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userEpisodes.id, existingEpisode.id));
    } else {
      // Insert new episode record
      await db.insert(userEpisodes).values({
        userId: session.user.id,
        userTvShowId: show.id,
        tvShowId,
        seasonNumber,
        episodeNumber,
        episodeName,
        watched,
        watchedAt: watched ? new Date() : null,
      });
    }

    // Update watched episode count for the show
    const watchedCount = await db.query.userEpisodes.findMany({
      where: and(
        eq(userEpisodes.userTvShowId, show.id),
        eq(userEpisodes.watched, true)
      ),
    });

    await db
      .update(userTvShows)
      .set({
        watchedEpisodes: watchedCount.length,
        updatedAt: new Date(),
      })
      .where(eq(userTvShows.id, show.id));

    return NextResponse.json({
      message: 'Episode updated successfully',
      watchedEpisodes: watchedCount.length,
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    return NextResponse.json(
      { error: 'Failed to update episode' },
      { status: 500 }
    );
  }
}

// GET - Get episodes for a season with watched status
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
    const { searchParams } = new URL(request.url);
    const seasonNumber = parseInt(searchParams.get('seasonNumber') || '1');

    if (isNaN(tvShowId) || isNaN(seasonNumber)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID or season number' },
        { status: 400 }
      );
    }

    // Fetch season details from TMDB
    const seasonDetails = await getSeasonDetails(tvShowId, seasonNumber);

    // Find the user's TV show record
    const show = await db.query.userTvShows.findFirst({
      where: and(
        eq(userTvShows.userId, session.user.id),
        eq(userTvShows.tvShowId, tvShowId)
      ),
    });

    // Get user's watched episodes for this season
    let watchedEpisodeNumbers: number[] = [];
    if (show) {
      const userWatchedEpisodes = await db.query.userEpisodes.findMany({
        where: and(
          eq(userEpisodes.userId, session.user.id),
          eq(userEpisodes.userTvShowId, show.id),
          eq(userEpisodes.seasonNumber, seasonNumber),
          eq(userEpisodes.watched, true)
        ),
      });
      watchedEpisodeNumbers = userWatchedEpisodes.map((ep) => ep.episodeNumber);
    }

    // Merge TMDB episodes with user's watched status
    const episodesWithStatus = seasonDetails.episodes.map((episode) => ({
      ...episode,
      watched: watchedEpisodeNumbers.includes(episode.episode_number),
    }));

    return NextResponse.json({ episodes: episodesWithStatus });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
