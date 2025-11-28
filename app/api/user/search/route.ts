import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        users: [],
        message: 'Search query must be at least 2 characters',
      });
    }

    const searchPattern = `%${query.trim()}%`;

    // Search for users by username or full name
    const foundUsers = await db
      .select({
        id: users.id,
        username: users.username,
        fullname: users.fullname,
        image: users.image,
        isPublic: users.isPublic,
      })
      .from(users)
      .where(
        or(
          ilike(users.username, searchPattern),
          ilike(users.fullname, searchPattern)
        )
      )
      .limit(20);

    return NextResponse.json({
      users: foundUsers,
      count: foundUsers.length,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
