import { createClient } from "@/lib/supabase/server";
import { GridBackground } from "@/components/shared/GridBackground";
import { redirect } from "next/navigation";
import { ListsContent } from "@/components/lists/ListsContent";
import { tmdbService } from "@/services/tmdb";
import { ListWithItems, EnhancedListItem } from "@/types/lists";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getListsData() {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		redirect("/login?redirectTo=/lists");
	}

	// Fetch all lists for the user with their items
	const { data: lists, error: listsError } = await supabase
		.from("lists")
		.select(
			`
      *,
      items:list_items (*)
    `
		)
		.eq("user_id", user.id)
		.order("updated_at", { ascending: false });

	if (listsError) {
		console.error("Error fetching lists:", listsError);
		throw new Error("Failed to fetch lists");
	}

	if (!lists) {
		return {
			lists: [] as ListWithItems[],
			user,
		};
	}

	// For each list, fetch show details for all items
	const listsWithShowDetails: ListWithItems[] = await Promise.all(
		lists.map(async (list) => {
			// Handle lists with no items
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
		lists: listsWithShowDetails,
		user,
	};
}

export default async function ListsPage() {
	const data = await getListsData();

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ListsContent initialLists={data.lists} user={data.user} />
			</div>
		</div>
	);
}
