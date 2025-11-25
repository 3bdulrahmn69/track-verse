import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userBooks, reviews, type UserBook } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get user's books by status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'want_to_read' | 'read' | null;

    let books;
    if (status) {
      books = await db
        .select()
        .from(userBooks)
        .where(
          and(
            eq(userBooks.userId, session.user.id),
            eq(userBooks.status, status)
          )
        );
    } else {
      books = await db
        .select()
        .from(userBooks)
        .where(eq(userBooks.userId, session.user.id));
    }

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST - Add book to user's list
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      bookId,
      bookTitle,
      bookCoverId,
      bookAuthors,
      bookFirstPublishYear,
      status,
      pagesRead,
      totalPages,
    } = body;

    if (!bookId || !bookTitle || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if book already exists for this user
    const existingBook = await db
      .select()
      .from(userBooks)
      .where(
        and(eq(userBooks.userId, session.user.id), eq(userBooks.bookId, bookId))
      )
      .limit(1);

    if (existingBook.length > 0) {
      // Update existing book
      const updateData: Partial<
        Pick<
          UserBook,
          | 'bookTitle'
          | 'bookCoverId'
          | 'bookAuthors'
          | 'bookFirstPublishYear'
          | 'status'
          | 'pagesRead'
          | 'totalPages'
          | 'updatedAt'
        >
      > = {
        updatedAt: new Date(),
      };

      if (bookTitle !== undefined) updateData.bookTitle = bookTitle;
      if (bookCoverId !== undefined) updateData.bookCoverId = bookCoverId;
      if (bookAuthors !== undefined)
        updateData.bookAuthors = bookAuthors
          ? JSON.stringify(bookAuthors)
          : null;
      if (bookFirstPublishYear !== undefined)
        updateData.bookFirstPublishYear = bookFirstPublishYear;
      if (status !== undefined) updateData.status = status;
      if (pagesRead !== undefined) updateData.pagesRead = pagesRead;
      if (totalPages !== undefined) updateData.totalPages = totalPages;

      const [updatedBook] = await db
        .update(userBooks)
        .set(updateData)
        .where(eq(userBooks.id, existingBook[0].id))
        .returning();

      return NextResponse.json({ book: updatedBook }, { status: 200 });
    }

    const [newBook] = await db
      .insert(userBooks)
      .values({
        userId: session.user.id,
        bookId,
        bookTitle,
        bookCoverId: bookCoverId || null,
        bookAuthors: bookAuthors ? JSON.stringify(bookAuthors) : null,
        bookFirstPublishYear: bookFirstPublishYear || null,
        status,
        pagesRead: pagesRead || null,
        totalPages: totalPages || null,
      })
      .returning();

    return NextResponse.json({ book: newBook }, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 });
  }
}

// PATCH - Update book status or details
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, status, pagesRead, totalPages } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Find the book
    const existingBook = await db
      .select()
      .from(userBooks)
      .where(
        and(eq(userBooks.userId, session.user.id), eq(userBooks.bookId, bookId))
      )
      .limit(1);

    if (existingBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Update the book
    const updateData: Partial<
      Pick<UserBook, 'status' | 'pagesRead' | 'totalPages' | 'updatedAt'>
    > = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (pagesRead !== undefined) updateData.pagesRead = pagesRead;
    if (totalPages !== undefined) updateData.totalPages = totalPages;

    // If marking as unread (want_to_read), delete any existing review
    if (status === 'want_to_read') {
      await db
        .delete(reviews)
        .where(
          and(
            eq(reviews.userId, session.user.id),
            eq(reviews.itemId, bookId),
            eq(reviews.itemType, 'book')
          )
        );
    }

    const [updatedBook] = await db
      .update(userBooks)
      .set(updateData)
      .where(eq(userBooks.id, existingBook[0].id))
      .returning();

    return NextResponse.json({ book: updatedBook }, { status: 200 });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE - Remove book from user's list
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Delete associated reviews first
    await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.userId, session.user.id),
          eq(reviews.itemId, bookId),
          eq(reviews.itemType, 'book')
        )
      );

    // Then delete the book
    const result = await db
      .delete(userBooks)
      .where(
        and(eq(userBooks.userId, session.user.id), eq(userBooks.bookId, bookId))
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Book removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
