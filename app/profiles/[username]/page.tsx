import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { GridBackground } from "@/components/shared/GridBackground";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { notFound, redirect } from "next/navigation";
import { getUserProfile } from "@/lib/utils/username";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProfilePageProps {
	params: Promise<{ username: string }>;
}

async function getProfileData(username: string) {
	const supabase = await createClient();
	const profile = await getUserProfile(supabase, username);

	if (!profile) redirect("/");

	// Get current viewer's ID to check if following
	const {
		data: { user: currentUser },
	} = await supabase.auth.getUser();

	// Get profile stats
	const [
		{ data: watchStatusCounts },
		{ data: reviews },
		{ data: lists },
		{ data: followers },
		{ data: following },
		{ data: watchHistory },
		{ data: isFollowing },
	] = await Promise.all([
		supabase.from("user_stats").select("*").eq("user_id", profile.id).single(),
		supabase.from("reviews").select("*", { count: "exact" }).eq("user_id", profile.id),
		supabase.from("lists").select("*", { count: "exact" }).eq("user_id", profile.id).eq("is_private", false),
		supabase.from("followers").select("*", { count: "exact" }).eq("following_id", profile.id),
		supabase.from("followers").select("*", { count: "exact" }).eq("follower_id", profile.id),
		supabase.from("watch_history").select("*", { count: "exact" }).eq("user_id", profile.id),
		currentUser
			? supabase.from("followers").select("*").eq("follower_id", currentUser.id).eq("following_id", profile.id).single()
			: Promise.resolve({ data: null }),
	]);

	// Calculate shows watched from pre-calculated stats
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

	// Get recent activity
	const [{ data: recentWatchHistory }, { data: recentReviews }, { data: recentLists }] = await Promise.all([
		supabase
			.from("watch_history")
			.select(
				`
			id,
			show_tmdb_id,
			show_name,
			watched_at,
			season_number,
			episode_number,
			poster_path
		  `
			)
			.eq("user_id", profile.id)
			.order("watched_at", { ascending: false })
			.limit(10),

		supabase
			.from("reviews")
			.select(
				`
			id,
			tmdb_id,
			content,
			rating,
			created_at,
			show_name,
			content_type
		  `
			)
			.eq("user_id", profile.id)
			.eq("content_type", "show")
			.order("created_at", { ascending: false })
			.limit(10),

		supabase
			.from("lists")
			.select(
				`
			id,
			title,
			created_at,
			items:list_items(count)
		  `
			)
			.eq("user_id", profile.id)
			.order("created_at", { ascending: false })
			.limit(10),
	]);

	// Combine and sort activities
	// In your profile page or wherever you fetch activities
	const activities = [
		...(recentWatchHistory?.map((activity) => ({
			id: activity.id,
			type: "WATCHED" as const,
			show: activity.show_tmdb_id.toString(),
			show_name: activity.show_name,
			timestamp: new Date(activity.watched_at),
			season_number: activity.season_number,
			episode_number: activity.episode_number,
			poster_path: activity.poster_path,
		})) ?? []),
		...(recentReviews?.map((review) => ({
			id: review.id,
			type: "REVIEWED" as const,
			show: review.tmdb_id.toString(),
			show_name: review.show_name,
			timestamp: new Date(review.created_at),
			rating: review.rating,
			content: review.content,
		})) ?? []),
		...(recentLists?.map((list) => ({
			id: list.id,
			type: "CREATED_LIST" as const,
			timestamp: new Date(list.created_at),
			title: list.title,
			showCount: list.items?.length ?? 0,
		})) ?? []),
	]
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, 10);

	return {
		profile,
		stats,
		activities,
		isOwnProfile: currentUser?.id === profile.id,
		isFollowing: !!isFollowing,
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const resolvedParams = await params;
	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Suspense fallback={<ProfileSkeleton />}>
					<ProfileContent username={resolvedParams.username} />
				</Suspense>
			</div>
		</div>
	);
}

async function ProfileContent({ username }: { username: string }) {
	const { profile, stats, activities, isOwnProfile, isFollowing } = await getProfileData(username);

	return (
		<>
			<ProfileHeader profile={profile} stats={stats} isOwnProfile={isOwnProfile} isFollowing={isFollowing} />
			<div className="mt-8 grid gap-8 lg:grid-cols-3 items-start">
				<StatsGrid stats={stats} className="lg:col-span-1" username={username} />
				<ActivityFeed activities={activities} className="lg:col-span-2" />
			</div>
		</>
	);
}
