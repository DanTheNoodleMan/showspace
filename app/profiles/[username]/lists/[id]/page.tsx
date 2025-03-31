import { createClient } from "@/lib/supabase/server";
import { GridBackground } from "@/components/shared/GridBackground";
import { notFound } from "next/navigation";
import { ListDetailContent } from "@/components/lists/ListDetailContent";
import { tmdbService } from "@/services/tmdb";
import { ListWithItems, EnhancedListItem } from "@/types/lists";
import { getUserProfile } from "@/lib/utils/username";

interface ListPageProps {
  params: Promise<{ username: string; id: string }>;
}

async function getListData(username: string, listId: string) {
  const supabase = await createClient();
  const profile = await getUserProfile(supabase, username);

  if (!profile) return notFound();

  // Get current viewer's ID to check if viewing own profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  // Fetch list with items, ordered by the order field
  const { data: list } = await supabase
    .from("lists")
    .select(`
      *,
      items:list_items(*)
    `)
    .eq("id", listId)
    .order('order', { foreignTable: 'items', ascending: true })
    .single();

  if (!list) return notFound();

  // Check if user has access to this list
  if (list.is_private && !isOwnProfile) return notFound();

  // Fetch show details for all items
  const itemsWithDetails: EnhancedListItem[] = await Promise.all(
    (list.items || []).map(async (item: any) => {
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

  const enhancedList: ListWithItems = {
    ...list,
    items: itemsWithDetails,
    itemCount: itemsWithDetails.length,
  };

  return {
    profile,
    list: enhancedList,
    isOwnProfile,
  };
}

export default async function ListPage({ params }: ListPageProps) {
  const resolvedParams = await params;
  const data = await getListData(resolvedParams.username, resolvedParams.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
      <div className="absolute inset-0">
        <GridBackground />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ListDetailContent 
          list={data.list} 
          isOwner={data.isOwnProfile} 
          username={resolvedParams.username} 
        />
      </div>
    </div>
  );
}