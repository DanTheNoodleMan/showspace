import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { username: string } }) {
	try {
		const supabase = await createClient();
		const { username } = await params;

		// Get the profile by username
		const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('username', username).single();

		if (profileError || !profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		// Get current user if authenticated
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		// Get all profile data
		const [
			{ data: watchStatusCounts },
			{ data: reviews },
			{ data: lists },
			{ data: followers },
			{ data: following },
			{ data: watchHistory },
			{ data: isFollowing },
		] = await Promise.all([
			supabase.from('user_stats').select('*').eq('user_id', profile.id).single(),
			supabase.from('reviews').select('*', { count: 'exact' }).eq('user_id', profile.id),
			supabase.from('lists').select('*', { count: 'exact' }).eq('user_id', profile.id).eq('is_private', false),
			supabase.from('followers').select('*', { count: 'exact' }).eq('following_id', profile.id),
			supabase.from('followers').select('*', { count: 'exact' }).eq('follower_id', profile.id),
			supabase.from('watch_history').select('*', { count: 'exact' }).eq('user_id', profile.id),
			currentUser
				? supabase.from('followers').select('*').eq('follower_id', currentUser.id).eq('following_id', profile.id).single()
				: Promise.resolve({ data: null }),
		]);

		const showsWatched = (watchStatusCounts?.watching_count ?? 0) + (watchStatusCounts?.completed_count ?? 0);

		const stats = {
			showsWatched,
			totalEpisodes: watchHistory?.length ?? 0,
			listsCreated: lists?.length ?? 0,
			followers: followers?.length ?? 0,
			following: following?.length ?? 0,
			reviewsWritten: reviews?.length ?? 0,
			currentStreak: profile.current_streak ?? 0,
		};

		return NextResponse.json({
			profile,
			stats,
			isOwnProfile: currentUser?.id === profile.id,
			isFollowing: !!isFollowing,
		});
	} catch (error) {
		console.error('Error in profile route:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
