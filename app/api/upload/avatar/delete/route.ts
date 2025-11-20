import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Extract public ID from URL
    const publicId = getPublicIdFromUrl(imageUrl);

    if (!publicId) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // Delete from Cloudinary
    const deleted = await deleteImage(publicId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
