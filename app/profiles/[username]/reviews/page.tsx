// /app/profiles/[username]/reviews/page.tsx
import { createClient } from "@/lib/supabase/server";
import { GridBackground } from "@/components/shared/GridBackground";
import { UserReviews } from "@/components/profile/UserReviews";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/utils/username";

interface ReviewsPageProps {
	params: Promise<{ username: string }>;
}

async function getReviewsData(username: string) {
	const supabase = await createClient();
	const profile = await getUserProfile(supabase, username);
	if (!profile) return notFound();

	// Get user's reviews with show details
	const { data: reviews } = await supabase
		.from("reviews")
		.select(
			`
      *,
      profiles:user_id (username, avatar_url)
    `
		)
		.eq("user_id", profile.id)
		.order("created_at", { ascending: false });

	// Get current viewer's ID to check if viewing own profile
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const isOwnProfile = user?.id === profile.id;

	return {
		profile,
		reviews: reviews || [],
		isOwnProfile,
	};
}

export default async function UserReviewsPage({ params }: ReviewsPageProps) {
	const resolvedParams = await params;
	const data = await getReviewsData(resolvedParams.username);
	console.log(data);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<UserReviews username={resolvedParams.username} reviews={data.reviews} isOwnProfile={data.isOwnProfile} />
			</div>
		</div>
	);
}
