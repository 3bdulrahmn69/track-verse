import { NextRequest, NextResponse } from 'next/server';
import { getPopularTVShows, getTopRatedTVShows } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');

    let data;
    if (type === 'popular') {
      data = await getPopularTVShows(page);
    } else if (type === 'top_rated') {
      data = await getTopRatedTVShows(page);
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch TV shows',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
