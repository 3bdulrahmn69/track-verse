import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userMovies, reviews } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMovieDetails } from '@/lib/tmdb';

// GET - Get user's movies by status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'want_to_watch'
      | 'watched'
      | null;

    let movies;
    if (status) {
      movies = await db
        .select()
        .from(userMovies)
        .where(
          and(
            eq(userMovies.userId, session.user.id),
            eq(userMovies.status, status)
          )
        );
    } else {
      movies = await db
        .select()
        .from(userMovies)
        .where(eq(userMovies.userId, session.user.id));
    }

    return NextResponse.json({ movies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

// POST - Add movie to user's list
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, movieTitle, moviePosterPath, movieReleaseDate, status } =
      body;
    let { runtime, tmdbRating, imdbId } = body;

    if (!movieId || !movieTitle || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If runtime or imdbId are missing, fetch complete movie details from TMDB
    if (!runtime || !imdbId) {
      try {
        const movieDetails = await getMovieDetails(movieId);
        runtime = runtime || movieDetails.runtime;
        imdbId = imdbId || movieDetails.imdb_id;
        tmdbRating = tmdbRating || Math.round(movieDetails.vote_average);
      } catch (error) {
        console.warn('Failed to fetch movie details from TMDB:', error);
        // Continue with the provided data if TMDB fetch fails
      }
    }

    // Check if movie already exists for this user
    const existingMovie = await db
      .select()
      .from(userMovies)
      .where(
        and(
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, movieId)
        )
      );

    if (existingMovie.length > 0) {
      // Update existing movie status
      const updateData: {
        status: 'want_to_watch' | 'watched';
        updatedAt: Date;
        watchCount?: number;
        runtime?: number | null;
        tmdbRating?: string | null;
        imdbId?: string | null;
      } = {
        status,
        updatedAt: new Date(),
      };

      // If marking as unwatched (want_to_watch), delete any existing review
      if (status === 'want_to_watch') {
        await db
          .delete(reviews)
          .where(
            and(
              eq(reviews.userId, session.user.id),
              eq(reviews.itemId, movieId.toString()),
              eq(reviews.itemType, 'movie')
            )
          );
      }

      // If marking as watched, increment watch count
      if (status === 'watched' && existingMovie[0].status !== 'watched') {
        updateData.watchCount = (existingMovie[0].watchCount || 0) + 1;
      }

      // Update TMDB data if provided
      if (tmdbRating !== undefined) {
        updateData.tmdbRating = tmdbRating
          ? Number(tmdbRating).toString()
          : null;
      }

      // Update missing data if we fetched it from TMDB
      if (runtime !== undefined && !existingMovie[0].runtime) {
        updateData.runtime = runtime;
      }
      if (imdbId !== undefined && !existingMovie[0].imdbId) {
        updateData.imdbId = imdbId;
      }

      const updated = await db
        .update(userMovies)
        .set(updateData)
        .where(
          and(
            eq(userMovies.userId, session.user.id),
            eq(userMovies.movieId, movieId)
          )
        )
        .returning();

      return NextResponse.json(
        { message: 'Movie status updated', movie: updated[0] },
        { status: 200 }
      );
    }

    // Add new movie
    const newMovie = await db
      .insert(userMovies)
      .values({
        userId: session.user.id,
        movieId,
        movieTitle,
        moviePosterPath,
        movieReleaseDate,
        status,
        runtime: runtime || null,
        tmdbRating: tmdbRating ? Number(tmdbRating).toString() : null,
        imdbId: imdbId || null,
      })
      .returning();

    return NextResponse.json(
      { message: 'Movie added successfully', movie: newMovie[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding movie:', error);
    return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 });
  }
}

// DELETE - Remove movie from user's list
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Delete associated review first
    await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.userId, session.user.id),
          eq(reviews.itemId, movieId),
          eq(reviews.itemType, 'movie')
        )
      );

    // Delete the movie
    await db
      .delete(userMovies)
      .where(
        and(
          eq(userMovies.userId, session.user.id),
          eq(userMovies.movieId, parseInt(movieId))
        )
      );

    return NextResponse.json(
      { message: 'Movie removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing movie:', error);
    return NextResponse.json(
      { error: 'Failed to remove movie' },
      { status: 500 }
    );
  }
}
