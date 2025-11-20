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
    const { name, email, username, dateOfBirth, image } = body;

    // Validate required fields
    if (!name || !email || !username) {
      return NextResponse.json(
        { error: 'Name, email, and username are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail.length > 0 && existingEmail[0].id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Check if username is already taken by another user
    if (username !== session.user.username) {
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (
        existingUsername.length > 0 &&
        existingUsername[0].id !== session.user.id
      ) {
        return NextResponse.json(
          { error: 'Username already in use' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    await db
      .update(users)
      .set({
        fullname: name,
        email,
        username,
        dateOfBirth: dateOfBirth || null,
        image: image || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
