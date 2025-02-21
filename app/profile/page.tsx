// /app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { redirect } from 'next/navigation';
import { GridBackground } from '@/components/shared/GridBackground';
import { headers } from 'next/headers';

export default async function ProfilePage() {
	const supabase = await createClient();
	// Use getUser for secure authentication check
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (!user || authError) {
		redirect('/login');
	}

	// Fetch profile data from our new API endpoint
	const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile`, {
		headers: {
			Cookie: (await headers()).get('cookie') || '',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch profile data');
	}

	const { profile, stats } = await response.json();

	// First fetch watch history
	const { data: watchHistory } = await supabase
		.from('watch_history')
		.select('*')
		.eq('user_id', user.id)
		.order('watched_at', { ascending: false })
		.limit(10);

		console.log("Watch History", watchHistory);
	// Then fetch recent reviews
	const { data: reviews } = await supabase
		.from('reviews')
		.select('*')
		.eq('user_id', user.id)
		.eq('content_type', 'show')
		.order('created_at', { ascending: false })
		.limit(10);

	// Combine and sort both types of activities
	const activities = [
		...(watchHistory?.map((activity) => ({
			id: activity.id,
			type: 'WATCHED' as const,
			show: activity.show_tmdb_id.toString(),
			timestamp: new Date(activity.watched_at),
		})) ?? []),
		...(reviews?.map((review) => ({
			id: review.id,
			type: 'REVIEWED' as const,
			show: review.tmdb_id.toString(),
			timestamp: new Date(review.created_at),
			rating: review.rating,
			content: review.content,
		})) ?? []),
	]
		// Sort combined activities by timestamp, most recent first
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		// Take only the 10 most recent activities
		.slice(0, 10);

		console.log(activities);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ProfileHeader user={user} stats={stats} />
				<div className="mt-8 grid gap-8 lg:grid-cols-3">
					<StatsGrid stats={stats} className="lg:col-span-1" />
					<ActivityFeed activities={activities} className="lg:col-span-2" />
				</div>
			</div>
		</div>
	);
}
