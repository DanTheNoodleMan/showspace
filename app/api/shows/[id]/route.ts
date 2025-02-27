// app/api/shows/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tmdbService } from '@/services/tmdb';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const resolvedParams = await params;
		const supabase = await createClient();
		const tmdbId = parseInt(resolvedParams.id);

		// Try to get auth session - but don't require it
		const {
			data: { user },
		} = await supabase.auth.getUser();

		const userId = user?.id; // This will be undefined for non-authenticated users

		// Get show details from TMDB
		const tmdbShow = await tmdbService.getShowDetails(tmdbId);

		// If user is logged in, get their data for this show
		let userData = null;
		if (userId) {
			const [{ data: watchStatus }, { data: review }, { data: episodeRatings }] = await Promise.all([
				// Get watch status
				supabase.from('watch_status').select('*').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('content_type', 'show').single(),

				// Get user's review
				supabase.from('reviews').select('*').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('content_type', 'show').single(),

				// Get all episode ratings for this show's episodes
				supabase
					.from('reviews')
					.select('tmdb_id, rating')
					.eq('user_id', userId)
					.eq('content_type', 'episode')
					.eq('parent_tmdb_id', tmdbId),
			]);

			// Convert episode ratings to a map for easier lookup
			const userEpisodeRatings =
				episodeRatings?.reduce((acc, curr) => {
					if (curr.tmdb_id && curr.rating) {
						acc[curr.tmdb_id] = curr.rating;
					}
					return acc;
				}, {} as Record<number, number>) ?? {};

			userData = {
				watchStatus,
				review,
				episodeRatings: userEpisodeRatings,
			};
		}

		// Get global show stats
		const { data: reviews } = await supabase.from('reviews').select('rating').eq('tmdb_id', tmdbId).eq('content_type', 'show');

		const averageRating = reviews?.length ? reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length : null;

		// For each season, fetch its episodes
		const seasonsWithEpisodes = await Promise.all(
			tmdbShow.seasons.map(async (season) => {
				const { episodes } = await tmdbService.getSeasonDetails(tmdbId, season.season_number);

				// If user is logged in, get their data for this season
				let seasonUserData = null;
				if (userId) {
					const [{ data: seasonWatchStatus }, { data: seasonReview }] = await Promise.all([
						supabase
							.from('watch_status')
							.select('*')
							.eq('user_id', userId)
							.eq('tmdb_id', season.id)
							.eq('content_type', 'season')
							.single(),
						supabase
							.from('reviews')
							.select('*')
							.eq('user_id', userId)
							.eq('tmdb_id', season.id)
							.eq('content_type', 'season')
							.single(),
					]);

					seasonUserData = {
						watchStatus: seasonWatchStatus,
						review: seasonReview,
					};
				}

				// Map episodes and include user ratings if available
				const mappedEpisodes = episodes.map((episode) => ({
					...episode,
					userRating: userData?.episodeRatings[episode.id] || null,
				}));

				return {
					...season,
					userData: seasonUserData,
					episodes: mappedEpisodes,
				};
			})
		);

		// Combine all data
		const showData = {
			...tmdbShow,
			userData,
			averageRating,
			seasons: seasonsWithEpisodes,
		};

		return NextResponse.json({ show: showData });
	} catch (error) {
		console.error('Error fetching show:', error);
		return NextResponse.json({ error: 'Failed to fetch show details' }, { status: 500 });
	}
}
