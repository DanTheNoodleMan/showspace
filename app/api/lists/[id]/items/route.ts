import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAuthenticatedApi } from "@/lib/auth/api-auth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const resolvedParams = await params;
		const listId = resolvedParams.id;
		const { tmdb_id, content_type = "show" } = await request.json();

		const supabase = await createClient();

		// Verify list ownership
		const { data: list, error: listError } = await supabase.from("lists").select("user_id").eq("id", listId).single();

		if (listError || !list) {
			return NextResponse.json({ error: "List not found" }, { status: 404 });
		}

		if (list.user_id !== user.id) {
			return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
		}

		// Check if item already exists in list
		const { data: existingItem } = await supabase.from("list_items").select().eq("list_id", listId).eq("tmdb_id", tmdb_id).single();

		if (existingItem) {
			return NextResponse.json({ error: "Item already exists in list" }, { status: 400 });
		}

		// Add item to list
		const { data: listItem, error } = await supabase
			.from("list_items")
			.insert({
				list_id: listId,
				tmdb_id,
				content_type,
				added_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) throw error;

		// Update list's updated_at timestamp
		await supabase.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", listId);

		return NextResponse.json({ listItem });
	} catch (error) {
		console.error("Error adding item to list:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add item to list" }, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const resolvedParams = await params;
		const listId = resolvedParams.id;
		const { searchParams } = new URL(request.url);
		const tmdbId = searchParams.get("tmdbId");

		if (!tmdbId) {
			return NextResponse.json({ error: "TMDB ID is required" }, { status: 400 });
		}

		const supabase = await createClient();

		// Verify list ownership
		const { data: list, error: listError } = await supabase.from("lists").select("user_id").eq("id", listId).single();

		if (listError || !list) {
			return NextResponse.json({ error: "List not found" }, { status: 404 });
		}

		if (list.user_id !== user.id) {
			return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
		}

		// Remove item from list
		const { error } = await supabase.from("list_items").delete().eq("list_id", listId).eq("tmdb_id", Number(tmdbId));

		if (error) throw error;

		// Update list's updated_at timestamp
		await supabase.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", listId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing item from list:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to remove item from list" }, { status: 500 });
	}
}

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const resolvedParams = await params;
		const listId = resolvedParams.id;

		const supabase = await createClient();

		// Get all items in the list
		const { data: items, error } = await supabase
			.from("list_items")
			.select(
				`
        *,
        list:lists!inner (
          user_id,
          is_private
        )
      `
			)
			.eq("list_id", listId);

		if (error) throw error;

		if (!items || items.length === 0) {
			return NextResponse.json({ items: [] });
		}

		// Check if the list is private
		const { user } = await checkAuthenticatedApi();
		if (items[0].list.is_private && (!user || items[0].list.user_id !== user.id)) {
			return NextResponse.json({ error: "Unauthorized to view this list" }, { status: 403 });
		}

		return NextResponse.json({ items });
	} catch (error) {
		console.error("Error fetching list items:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch list items" }, { status: 500 });
	}
}
