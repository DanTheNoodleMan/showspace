import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkAuthenticatedApi } from '@/lib/auth/api-auth';

interface RouteParams {
	params: {
		username: string;
	};
}

export async function POST(request: NextRequest, context: RouteParams) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const supabase = await createClient();
		const { username } = context.params;

		// Get the profile to follow
		const { data: profileToFollow, error: profileError } = await supabase
			.from('profiles')
			.select('id')
			.eq('username', username)
			.single();

		if (profileError || !profileToFollow) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		// Can't follow yourself
		if (profileToFollow.id === user.id) {
			return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
		}

		// Insert the follow relationship
		const { error: followError } = await supabase.from('followers').insert({
			follower_id: user.id,
			following_id: profileToFollow.id,
		});

		if (followError?.code === '23505') {
			// Unique violation
			return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
		}

		if (followError) {
			throw followError;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in follow route:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, context: RouteParams) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const supabase = await createClient();
		const { username } = context.params;

		// Get the profile to unfollow
		const { data: profileToUnfollow, error: profileError } = await supabase
			.from('profiles')
			.select('id')
			.eq('username', username)
			.single();

		if (profileError || !profileToUnfollow) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		// Delete the follow relationship
		const { error: unfollowError } = await supabase
			.from('followers')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', profileToUnfollow.id);

		if (unfollowError) {
			throw unfollowError;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in unfollow route:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
