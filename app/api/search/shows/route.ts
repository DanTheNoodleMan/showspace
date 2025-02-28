import { NextRequest, NextResponse } from 'next/server';
import { tmdbService } from '@/services/tmdb';
import { mapTMDBShowToShow } from '@/types/tmdb';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get('q');
		const page = parseInt(searchParams.get('page') || '1');

		if (!query) {
			return NextResponse.json({ shows: [], page: 1, totalPages: 0, totalResults: 0 });
		}

		const response = await tmdbService.searchShows(query, page);
		const shows = response.results.map(mapTMDBShowToShow);

		const popularityOrderedShows = shows.sort((a, b) => b.popularity - a.popularity);

		return NextResponse.json({
			popularityOrderedShows,
			page: response.page,
			totalPages: response.total_pages,
			totalResults: response.total_results,
		});
	} catch (error) {
		console.error('Error searching shows:', error);
		return NextResponse.json({ error: 'Failed to search shows' }, { status: 500 });
	}
}
