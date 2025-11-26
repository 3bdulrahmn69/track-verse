import { NextRequest, NextResponse } from 'next/server';
import { getPopularGames, getRecentGames } from '@/lib/rawg';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');

    let games;
    if (type === 'popular') {
      games = await getPopularGames(page);
    } else if (type === 'recent') {
      games = await getRecentGames(page);
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error('Error fetching discover games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
