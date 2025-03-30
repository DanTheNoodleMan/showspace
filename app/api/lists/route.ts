import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAuthenticatedApi } from "@/lib/auth/api-auth";
import { CreateListInput, UpdateListInput } from "@/types/lists";

export async function POST(request: Request) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const data: CreateListInput = await request.json();
		const supabase = await createClient();

		console.log(data);

		const { data: list, error } = await supabase
			.from("lists")
			.insert({
				title: data.title,
				description: data.description,
				is_private: data.isPrivate,
				list_type: data.listType,
				user_id: user.id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

			console.log(list);

		if (error) throw error;

		return NextResponse.json({ list });
	} catch (error) {
		console.error("Error creating list:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create list" }, { status: 500 });
	}
}

export async function GET(request: Request) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const listType = searchParams.get("type");

		const supabase = await createClient();

		let query = supabase
			.from("lists")
			.select(
				`
        *,
        items:list_items (
          tmdb_id,
          content_type,
          added_at
        )
      `
			)
			.eq("user_id", user.id)
			.order("updated_at", { ascending: false });

		if (listType) {
			query = query.eq("list_type", listType);
		}

		const { data: lists, error } = await query;

		if (error) throw error;

		// Transform the data to include item count
		const transformedLists = lists.map((list) => ({
			...list,
			itemCount: list.items?.length || 0,
		}));

		return NextResponse.json({ lists: transformedLists });
	} catch (error) {
		console.error("Error fetching lists:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch lists" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const { id, ...data }: { id: string } & UpdateListInput = await request.json();
		const supabase = await createClient();

		// Verify ownership
		const { data: existingList } = await supabase.from("lists").select("user_id").eq("id", id).single();

		if (!existingList || existingList.user_id !== user.id) {
			return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
		}

		const { data: updatedList, error } = await supabase
			.from("lists")
			.update({
				...data,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({ list: updatedList });
	} catch (error) {
		console.error("Error updating list:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update list" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const listId = searchParams.get("id");

		if (!listId) {
			return NextResponse.json({ error: "List ID is required" }, { status: 400 });
		}

		const supabase = await createClient();

		// Verify ownership
		const { data: existingList } = await supabase.from("lists").select("user_id").eq("id", listId).single();

		if (!existingList || existingList.user_id !== user.id) {
			return NextResponse.json({ error: "Unauthorized to delete this list" }, { status: 403 });
		}

		// Delete list items first (cascade should handle this, but being explicit)
		await supabase.from("list_items").delete().eq("list_id", listId);

		// Delete the list
		const { error: deleteError } = await supabase.from("lists").delete().eq("id", listId);

		if (deleteError) throw deleteError;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting list:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete list" }, { status: 500 });
	}
}
