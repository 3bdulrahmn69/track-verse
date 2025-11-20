import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with .avif format for optimization
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'track-verse/avatars',
      public_id: `user_${session.user.id}_${Date.now()}`,
      transformation: [
        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'avif' },
      ],
      format: 'avif',
      allowed_formats: ['jpg', 'png', 'webp', 'avif'],
    });

    // Return the public ID and secure URL
    return NextResponse.json({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
