import { Database } from "@/lib/supabase/database.types";

export type DbList = Database["public"]["Tables"]["lists"]["Row"];
export type DbListItem = Database["public"]["Tables"]["list_items"]["Row"];

export interface ShowDetails {
	name: string;
	poster_path: string | null;
	first_air_date: string;
	vote_average: number;
}

export interface EnhancedListItem extends DbListItem {
	show?: ShowDetails;
}

export interface ListWithItems extends DbList {
	items: EnhancedListItem[];
	itemCount: number;
}

export type ListType = "custom" | "watchlist" | "favorites";

export interface CreateListInput {
	title: string;
	description?: string;
	isPrivate: boolean;
	listType: ListType;
}

export interface UpdateListInput {
	title?: string;
	description?: string;
	isPrivate?: boolean;
}

// Guard type for list items
export function isShowListItem(item: EnhancedListItem): boolean {
	return item.content_type === "show" && !!item.show;
}
