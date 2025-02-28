// app/api/profile/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkAuthenticatedApi } from '@/lib/auth/api-auth';

export async function GET() {
	try {
		const supabase = await createClient();

		const { user, error } = await checkAuthenticatedApi();
		if (error) return error;

		// Get user profile data
		const [
			{ data: profile },
			{ data: watchStatusCounts, error: watchStatusError },
			{ data: reviews, error: reviewsError },
			{ data: lists, error: listsError },
			{ data: followers, error: followersError },
			{ data: following, error: followingError },
			{ data: watchHistory, error: watchHistoryError },
		] = await Promise.all([
			// Get profile data
			supabase.from('profiles').select('*').eq('id', user.id).single(),

			// Get user stats from pre-calculated table
			supabase.from('user_stats').select('*').eq('user_id', user.id).single(),

			// Get review count
			supabase.from('reviews').select('*', { count: 'exact' }).eq('user_id', user.id),

			// Get lists count
			supabase.from('lists').select('*', { count: 'exact' }).eq('user_id', user.id),

			// Get followers count
			supabase.from('followers').select('*', { count: 'exact' }).eq('following_id', user.id),

			// Get following count
			supabase.from('followers').select('*', { count: 'exact' }).eq('follower_id', user.id),

			// Get total episodes watched
			supabase.from('watch_history').select('*', { count: 'exact' }).eq('user_id', user.id),
		]);

		if (watchStatusError || reviewsError || listsError || followersError || followingError || watchHistoryError) {
			throw new Error('Error fetching profile data');
		}

		// Calculate shows watched from pre-calculated stats
		const showsWatched = (watchStatusCounts?.watching_count ?? 0) + (watchStatusCounts?.completed_count ?? 0);

		const stats = {
			showsWatched,
			totalEpisodes: watchHistory?.length ?? 0,
			listsCreated: lists?.length ?? 0,
			followers: followers?.length ?? 0,
			following: following?.length ?? 0,
			reviewsWritten: reviews?.length ?? 0,
			currentStreak: profile?.current_streak ?? 0,
		};

		return NextResponse.json({
			profile,
			stats,
			watchStatusCounts,
		});
	} catch (error) {
		console.error('Error in profile route:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
