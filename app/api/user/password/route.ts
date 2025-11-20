import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Cannot change password for OAuth accounts' },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
