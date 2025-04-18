import { createClient } from "@/lib/supabase/server";
import { GridBackground } from "@/components/shared/GridBackground";
import { redirect, notFound } from "next/navigation";
import { ListsContent } from "@/components/lists/ListsContent";
import { tmdbService } from "@/services/tmdb";
import { ListWithItems, EnhancedListItem } from "@/types/lists";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserProfile } from "@/lib/utils/username";

interface ProfileListsPageProps {
	params: Promise<{ username: string }>;
}

async function getProfileListsData(username: string) {
	const supabase = await createClient();
	const profile = await getUserProfile(supabase, username);

	if (!profile) return notFound();

	// Get current viewer's ID to check if viewing own profile
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const isOwnProfile = user?.id === profile.id;

	// Fetch all public lists for the user (and private if own profile)
	const listQuery = supabase
		.from("lists")
		.select(
			`
      *,
      items:list_items (*)
    `
		)
		.eq("user_id", profile.id)
		.order("updated_at", { ascending: false });

	// Only show private lists if viewing own profile
	if (!isOwnProfile) {
		listQuery.eq("is_private", false);
	}

	const { data: lists, error: listsError } = await listQuery;

	if (listsError) {
		console.error("Error fetching lists:", listsError);
		throw new Error("Failed to fetch lists");
	}

	if (!lists) {
		return {
			profile,
			lists: [] as ListWithItems[],
			isOwnProfile,
		};
	}

	// For each list, fetch show details for all items
	const listsWithShowDetails: ListWithItems[] = await Promise.all(
		lists.map(async (list) => {
			if (!list.items) {
				return {
					...list,
					items: [],
					itemCount: 0,
				};
			}

			const itemsWithDetails: EnhancedListItem[] = await Promise.all(
				list.items.map(async (item) => {
					if (item.content_type === "show" && item.tmdb_id) {
						try {
							const showData = await tmdbService.getShowDetails(item.tmdb_id);
							return {
								...item,
								show: {
									name: showData.name,
									poster_path: showData.poster_path,
									first_air_date: showData.first_air_date,
									vote_average: showData.vote_average,
								},
							};
						} catch (error) {
							console.error(`Error fetching show details for ID ${item.tmdb_id}:`, error);
							return item;
						}
					}
					return item;
				})
			);

			return {
				...list,
				items: itemsWithDetails,
				itemCount: itemsWithDetails.length,
			};
		})
	);

	return {
		profile,
		lists: listsWithShowDetails,
		isOwnProfile,
	};
}

export default async function ProfileListsPage({ params }: ProfileListsPageProps) {
	const resolvedParams = await params;
	const data = await getProfileListsData(resolvedParams.username);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header with back button */}

				<div className="flex items-center gap-4 mb-8">
					<h1
						className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl md:text-3xl font-black tracking-wider text-transparent"
						style={{ textShadow: "4px 4px 8px rgba(255,255,255,0.5)" }}
					>
						{data.isOwnProfile ? "Your lists" : `${resolvedParams.username}'s lists`}
					</h1>
				</div>

				<ListsContent initialLists={data.lists} isReadOnly={!data.isOwnProfile} profile={data.profile} />
			</div>
		</div>
	);
}
