import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import {
  reviews,
  users,
  userBooks,
  userMovies,
  userEpisodes,
  userTvShows,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getBookDetails, getAuthorDetails } from '@/lib/books';
import { getMovieDetails } from '@/lib/tmdb';

type ItemType = 'book' | 'movie' | 'tv_episode' | 'game';

// GET - Get all reviews for a specific item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType') as ItemType;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId and itemType are required' },
        { status: 400 }
      );
    }

    // Fetch all reviews for this item
    const itemReviews = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        userName: users.fullname,
        username: users.username,
        userImage: users.image,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.itemId, itemId), eq(reviews.itemType, itemType)))
      .orderBy(reviews.createdAt);

    const formattedReviews = itemReviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      userName: review.userName || 'Anonymous',
      username: review.username || 'anonymous',
      userImage: review.userImage,
      userRating: review.rating,
      userComment: review.comment || '',
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments: formattedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Add a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, itemType, rating, comment } = await request.json();

    if (!itemId || !itemType || !rating) {
      return NextResponse.json(
        { error: 'itemId, itemType, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already has a review for this item
    const existingReview = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, session.user.id),
          eq(reviews.itemId, itemId),
          eq(reviews.itemType, itemType)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 400 }
      );
    }

    // Handle item-specific logic based on type
    if (itemType === 'book') {
      await handleBookReview(session.user.id, itemId);
    } else if (itemType === 'movie') {
      await handleMovieReview(session.user.id, parseInt(itemId));
    } else if (itemType === 'tv_episode') {
      await handleEpisodeReview(session.user.id, itemId);
    }

    // Insert the review
    await db.insert(reviews).values({
      userId: session.user.id,
      itemId,
      itemType,
      rating,
      comment: comment || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing review
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, rating, comment } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update the review (ensure it belongs to the current user)
    const updated = await db
      .update(reviews)
      .set({
        rating,
        comment: comment || null,
        updatedAt: new Date(),
      })
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    // Delete only the review, not the item from library
    const deleted = await db
      .delete(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// Helper function to handle book review logic
async function handleBookReview(userId: string, bookId: string) {
  // Check if book is in user's library
  const existingBook = await db
    .select()
    .from(userBooks)
    .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
    .limit(1);

  if (existingBook.length === 0) {
    // Add book to library with 'read' status
    const book = await getBookDetails(bookId);

    if (!book) {
      throw new Error('Book not found');
    }

    // Fetch author names
    let authorNames: string[] = [];
    if (book.authors && book.authors.length > 0) {
      try {
        const authorPromises = book.authors.map(async (a) => {
          try {
            const authorDetails = await getAuthorDetails(a.author.key);
            return authorDetails.name;
          } catch {
            return 'Unknown';
          }
        });
        authorNames = await Promise.all(authorPromises);
      } catch (error) {
        console.warn('Failed to fetch author details:', error);
        authorNames = book.authors.map(() => 'Unknown');
      }
    }

    await db.insert(userBooks).values({
      userId,
      bookId,
      bookTitle: book.title || 'Unknown Title',
      bookCoverId: book.covers?.[0] || null,
      bookAuthors: JSON.stringify(authorNames),
      bookFirstPublishYear: book.first_publish_date
        ? (() => {
            try {
              return new Date(book.first_publish_date).getFullYear();
            } catch {
              return null;
            }
          })()
        : null,
      status: 'read',
    });
  } else {
    // Update status to 'read' if not already
    await db
      .update(userBooks)
      .set({ status: 'read', updatedAt: new Date() })
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));
  }
}

// Helper function to handle movie review logic
async function handleMovieReview(userId: string, movieId: number) {
  // Check if movie is in user's library
  const existingMovie = await db
    .select()
    .from(userMovies)
    .where(and(eq(userMovies.userId, userId), eq(userMovies.movieId, movieId)))
    .limit(1);

  if (existingMovie.length === 0) {
    // Add movie to library with 'watched' status
    const movie = await getMovieDetails(movieId);

    if (!movie) {
      throw new Error('Movie not found');
    }

    await db.insert(userMovies).values({
      userId,
      movieId,
      movieTitle: movie.title,
      moviePosterPath: movie.poster_path || null,
      movieReleaseDate: movie.release_date || null,
      status: 'watched',
      runtime: movie.runtime || null,
      tmdbRating: movie.vote_average ? movie.vote_average.toString() : null,
      imdbId: movie.imdb_id || null,
    });
  } else {
    // Update status to 'watched' if not already
    await db
      .update(userMovies)
      .set({ status: 'watched', updatedAt: new Date() })
      .where(
        and(eq(userMovies.userId, userId), eq(userMovies.movieId, movieId))
      );
  }
}

// Helper function to handle TV episode review logic
async function handleEpisodeReview(userId: string, episodeId: string) {
  // Parse episodeId format: tvShowId-S{season}E{episode}
  const match = episodeId.match(/^(\d+)-S(\d+)E(\d+)$/);
  if (!match) {
    throw new Error('Invalid episode ID format');
  }

  const tvShowId = parseInt(match[1]);
  const seasonNumber = parseInt(match[2]);
  const episodeNumber = parseInt(match[3]);

  // Find the user's TV show entry
  const userTvShow = await db
    .select()
    .from(userTvShows)
    .where(
      and(eq(userTvShows.userId, userId), eq(userTvShows.tvShowId, tvShowId))
    )
    .limit(1);

  if (userTvShow.length === 0) {
    throw new Error('TV show not in user library');
  }

  // Check if episode exists
  const existingEpisode = await db
    .select()
    .from(userEpisodes)
    .where(
      and(
        eq(userEpisodes.userId, userId),
        eq(userEpisodes.tvShowId, tvShowId),
        eq(userEpisodes.seasonNumber, seasonNumber),
        eq(userEpisodes.episodeNumber, episodeNumber)
      )
    )
    .limit(1);

  if (existingEpisode.length > 0) {
    // Mark episode as watched if not already
    await db
      .update(userEpisodes)
      .set({ watched: true, watchedAt: new Date(), updatedAt: new Date() })
      .where(eq(userEpisodes.id, existingEpisode[0].id));
  }
}
