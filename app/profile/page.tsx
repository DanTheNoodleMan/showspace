// /app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect('/login');
	}

	// Fetch user stats (mock data for now)
	const stats = {
		showsWatched: 142,
		totalEpisodes: 1876,
		listsCreated: 12,
		followers: 89,
		following: 76,
		reviewsWritten: 45,
	};

	// Fetch recent activity (mock data for now)
	const activities = [
		{
			id: 1,
			type: "WATCHED" as "WATCHED",
			show: 'Stranger Things',
			timestamp: new Date('2024-02-19T15:30:00'),
			rating: 4.5,
		},
		{
			id: 2,
			type: "REVIEWED" as "REVIEWED",
			show: 'The Bear',
			content: 'Absolutely incredible! The tension, the characters...',
			timestamp: new Date('2024-02-18T10:15:00'),
		},
		{
			id: 3,
			type: "CREATED_LIST" as "CREATED_LIST",
			title: 'Best Cooking Shows',
			showCount: 8,
			timestamp: new Date('2024-02-17T20:45:00'),
		},
		// Add more activities...
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pb-16 pt-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ProfileHeader user={session.user} stats={stats} />
				<div className="mt-8 grid gap-8 lg:grid-cols-3">
					<StatsGrid stats={stats} className="lg:col-span-1" />
					<ActivityFeed activities={activities} className="lg:col-span-2" />
				</div>
			</div>
		</div>
	);
}
