// app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { GridBackground } from '@/components/shared/GridBackground';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfileData() {
	const supabase = await createClient();

	// Fetch profile data
	const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile`, {
		headers: {
			Cookie: (await headers()).get('cookie') || '',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch profile data');
	}

	const { profile, stats } = await response.json();

	// Fetch watch history and reviews
	const [{ data: watchHistory }, { data: reviews }] = await Promise.all([
		supabase.from('watch_history').select('*').order('watched_at', { ascending: false }).limit(10),
		supabase.from('reviews').select('*').eq('content_type', 'show').order('created_at', { ascending: false }).limit(10),
	]);

	// Combine and sort activities
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
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, 10);

	return { profile, stats, activities };
}

export default async function ProfilePage() {
	// No need for auth check here - middleware handles it
	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Suspense fallback={<ProfileSkeleton />}>
					<ProfileContent />
				</Suspense>
			</div>
		</div>
	);
}

async function ProfileContent() {
	const { profile, stats, activities } = await getProfileData();

	return (
		<>
			<ProfileHeader profile={profile} stats={stats} />
			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				<StatsGrid stats={stats} className="lg:col-span-1" />
				<ActivityFeed activities={activities} className="lg:col-span-2" />
			</div>
		</>
	);
}
