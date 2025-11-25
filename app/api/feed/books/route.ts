import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { userBooks, users } from '@/lib/db/schema';
import { eq, desc, inArray, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get list of users that the current user follows (accepted follows only)
    const { userFollows } = await import('@/lib/db/schema');
    const follows = await db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.status, 'accepted')
        )
      );

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({ books: [] }, { status: 200 });
    }

    // Get books from followed users
    const feedBooks = await db
      .select({
        id: userBooks.id,
        bookId: userBooks.bookId,
        bookTitle: userBooks.bookTitle,
        bookCoverId: userBooks.bookCoverId,
        bookAuthors: userBooks.bookAuthors,
        bookFirstPublishYear: userBooks.bookFirstPublishYear,
        status: userBooks.status,
        pagesRead: userBooks.pagesRead,
        totalPages: userBooks.totalPages,
        createdAt: userBooks.createdAt,
        updatedAt: userBooks.updatedAt,
        userId: userBooks.userId,
        user: {
          id: users.id,
          fullname: users.fullname,
          username: users.username,
          image: users.image,
        },
      })
      .from(userBooks)
      .innerJoin(users, eq(userBooks.userId, users.id))
      .where(inArray(userBooks.userId, followingIds))
      .orderBy(desc(userBooks.updatedAt))
      .limit(50);

    return NextResponse.json({ books: feedBooks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching books feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books feed' },
      { status: 500 }
    );
  }
}
