// src/app/api/shows/trending/route.ts

import { NextResponse } from 'next/server';
import { tmdbService } from '@/services/tmdb';
import { mapTMDBShowToShow } from '@/types/tmdb';

class TMDBError extends Error {
	constructor(public statusCode: number, message: string) {
		super(message);
		this.name = 'TMDBError';
	}
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const timeWindow = (searchParams.get('timeWindow') as 'day' | 'week') || 'day';

		const response = await tmdbService.getTrendingShows(timeWindow);

		console.log(response.results[0].origin_country);

		const shows = response.results.map(mapTMDBShowToShow);

		return NextResponse.json({
			shows,
			page: response.page,
			totalPages: response.total_pages,
			totalResults: response.total_results,
		});
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: error instanceof TMDBError ? error.statusCode : 500 });
		}
		return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
}
