import { createClient } from '@/lib/supabase/server';
import { GridBackground } from '@/components/shared/GridBackground';
import { notFound } from 'next/navigation';
import { Connections } from './Connections';

interface ConnectionsPageProps {
	params: {
		username: string;
	};
	searchParams: {
		tab?: 'following' | 'followers';
	};
}

async function getConnectionsData(username: string) {
	const supabase = await createClient();
	const formattedUsername = username.toLowerCase();

	// Get the profile
	const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('username', formattedUsername).single();

	console.log(profileError, profile);
	if (profileError || !profile) {
		return notFound();
	}

	// Get current user if authenticated
	const {
		data: { user: currentUser },
	} = await supabase.auth.getUser();

	// Get followers and following
	const [{ data: followers }, { data: following }] = await Promise.all([
		supabase
			.from('followers')
			.select('follower_id, profiles!followers_follower_id_fkey(id, username, display_name, avatar_url)')
			.eq('following_id', profile.id),
		supabase
			.from('followers')
			.select('following_id, profiles!followers_following_id_fkey(id, username, display_name, avatar_url)')
			.eq('follower_id', profile.id),
	]);

	// If user is logged in, check who they're following
	let followingMap = new Map();
	if (currentUser) {
		const { data: userFollowing } = await supabase.from('followers').select('following_id').eq('follower_id', currentUser.id);

		userFollowing?.forEach(({ following_id }) => followingMap.set(following_id, true));
	}

	// Format the data and add isFollowing flag
	const formattedFollowers =
		followers?.map((f) => ({
			...f.profiles,
			isFollowing: followingMap.has(f.profiles.id),
		})) || [];

	const formattedFollowing =
		following?.map((f) => ({
			...f.profiles,
			isFollowing: followingMap.has(f.profiles.id),
		})) || [];

	return {
		profile,
		followers: formattedFollowers,
		following: formattedFollowing,
		isOwnProfile: currentUser?.id === profile.id,
	};
}

export default async function ConnectionsPage({ params, searchParams }: ConnectionsPageProps) {
	const resolvedParams = await params;
	const resolvedSearch = await searchParams;
	const data = await getConnectionsData(resolvedParams.username);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<Connections
					profile={data.profile}
					followers={data.followers}
					following={data.following}
					isOwnProfile={data.isOwnProfile}
					initialTab={resolvedSearch.tab || 'followers'}
				/>
			</div>
		</div>
	);
}
