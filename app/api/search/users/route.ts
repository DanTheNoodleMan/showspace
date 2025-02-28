import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q');

		if (!query) {
			return NextResponse.json({ users: [] });
		}

		const supabase = await createClient();

		// Get current user for checking follow status
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		// Search for users by username or display name
		const { data: users, error } = await supabase
			.from('profiles')
			.select('id, username, display_name, avatar_url, bio')
			.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
			.limit(10);

		if (error) {
			throw error;
		}

		// If user is logged in, check follow status for each user
		if (currentUser && users) {
			const followData = await Promise.all(
				users.map(async (user) => {
					const { data } = await supabase
						.from('followers')
						.select('*')
						.eq('follower_id', currentUser.id)
						.eq('following_id', user.id)
						.single();

					return {
						...user,
						isFollowing: !!data,
					};
				})
			);

			return NextResponse.json({ users: followData });
		}

		return NextResponse.json({ users: users?.map((user) => ({ ...user, isFollowing: false })) });
	} catch (error) {
		console.error('Error searching users:', error);
		return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
	}
}
