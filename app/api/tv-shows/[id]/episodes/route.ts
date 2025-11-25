import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userEpisodes, userTvShows, reviews } from '@/lib/db/schema';
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
    const { seasonNumber, episodeNumber, episodeName, runtime, watched } = body;

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
      const updateData: {
        watched: boolean;
        watchedAt?: Date | null;
        runtime?: number | null;
        episodeName?: string;
        updatedAt: Date;
      } = {
        watched,
        watchedAt: watched ? new Date() : null,
        updatedAt: new Date(),
      };

      // If marking as unwatched, delete any existing review
      if (!watched) {
        const episodeId = `${tvShowId}-S${seasonNumber}E${episodeNumber}`;
        await db
          .delete(reviews)
          .where(
            and(
              eq(reviews.userId, session.user.id),
              eq(reviews.itemId, episodeId),
              eq(reviews.itemType, 'tv_episode')
            )
          );
      }

      if (runtime !== undefined) {
        updateData.runtime = runtime;
      }

      if (episodeName !== undefined) {
        updateData.episodeName = episodeName;
      }

      await db
        .update(userEpisodes)
        .set(updateData)
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
        runtime,
        watched,
        watchedAt: watched ? new Date() : null,
      });
    }

    // Update watched episode count for the show
    const watchedCount = await db
      .select({
        id: userEpisodes.id,
        episodeNumber: userEpisodes.episodeNumber,
      })
      .from(userEpisodes)
      .where(
        and(
          eq(userEpisodes.userTvShowId, show.id),
          eq(userEpisodes.watched, true)
        )
      );

    const newWatchedCount = watchedCount.length;

    // Check if all episodes are now watched (automatic completion)
    let showCompleted = false;
    let showStatusChanged = false;
    if (
      watched &&
      show.totalEpisodes &&
      newWatchedCount === show.totalEpisodes
    ) {
      // All episodes are watched, mark show as completed
      await db
        .update(userTvShows)
        .set({
          status: 'completed',
          watchedEpisodes: newWatchedCount,
          updatedAt: new Date(),
        })
        .where(eq(userTvShows.id, show.id));
      showCompleted = true;
    } else if (!watched && show.status === 'completed') {
      // Episode marked as unwatched and show was completed, change status to watching
      await db
        .update(userTvShows)
        .set({
          status: 'watching',
          watchedEpisodes: newWatchedCount,
          updatedAt: new Date(),
        })
        .where(eq(userTvShows.id, show.id));
      showStatusChanged = true;
    } else {
      // Just update the watched count
      await db
        .update(userTvShows)
        .set({
          watchedEpisodes: newWatchedCount,
          updatedAt: new Date(),
        })
        .where(eq(userTvShows.id, show.id));
    }

    return NextResponse.json({
      message: showCompleted
        ? 'Episode updated successfully. Show marked as completed!'
        : showStatusChanged
        ? 'Episode updated successfully. Show status changed to watching.'
        : 'Episode updated successfully',
      watchedEpisodes: newWatchedCount,
      showCompleted,
      showStatusChanged,
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
    let userEpisodeData: {
      episodeNumber: number;
      watched: boolean;
    }[] = [];
    if (show) {
      const userEpisodesData = await db
        .select({
          episodeNumber: userEpisodes.episodeNumber,
          watched: userEpisodes.watched,
        })
        .from(userEpisodes)
        .where(
          and(
            eq(userEpisodes.userId, session.user.id),
            eq(userEpisodes.userTvShowId, show.id),
            eq(userEpisodes.seasonNumber, seasonNumber)
          )
        );
      userEpisodeData = userEpisodesData;
    }

    // Merge TMDB episodes with user's watched status
    const episodesWithStatus = seasonDetails.episodes.map((episode) => {
      const userData = userEpisodeData.find(
        (data) => data.episodeNumber === episode.episode_number
      );
      return {
        ...episode,
        watched: userData?.watched || false,
      };
    });

    return NextResponse.json({ episodes: episodesWithStatus });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
