import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    // Update privacy setting
    await db
      .update(users)
      .set({
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
    });
  } catch (error) {
    console.error('Privacy update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}
