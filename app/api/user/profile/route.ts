import { auth } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, username, dateOfBirth, image } = body;

    // Validate required fields (email is now optional as it's handled separately)
    if (!name || !username) {
      return NextResponse.json(
        { error: 'Name and username are required' },
        { status: 400 }
      );
    }

    // Check if email is being updated and validate
    if (email && email !== session.user.email) {
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

    // If image is being updated or removed, delete old image from Cloudinary
    if (image !== undefined) {
      const currentUser = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (currentUser[0]?.image) {
        const publicId = getPublicIdFromUrl(currentUser[0].image);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    // Update user profile
    const updateData: {
      fullname: string;
      username: string;
      dateOfBirth?: string | null;
      image: string | null;
      email?: string;
      updatedAt: Date;
    } = {
      fullname: name,
      username,
      image: image || null,
      updatedAt: new Date(),
    };

    // Only update dateOfBirth if provided (temporary until migration is run)
    if (dateOfBirth) {
      updateData.dateOfBirth = dateOfBirth;
    }

    // Only update email if provided
    if (email) {
      updateData.email = email;
    }

    await db.update(users).set(updateData).where(eq(users.id, session.user.id));

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
