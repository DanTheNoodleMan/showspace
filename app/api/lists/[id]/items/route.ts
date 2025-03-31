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

		// Call the RPC function
		const { data, error } = await supabase.rpc("add_list_item", {
			p_list_id: listId,
			p_user_id: user.id,
			p_tmdb_id: tmdb_id,
			p_content_type: content_type,
		});

		if (error) {
			if (error.code === "23505") {
				// Unique violation
				return NextResponse.json({ error: "Item already exists in list" }, { status: 400 });
			}
			if (error.code === "P0001") {
				// Custom error (unauthorized)
				return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
			}
			throw error;
		}

		return NextResponse.json({ listItem: data });
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

		// Verify list ownership and delete item in one query using RPC
		const { error } = await supabase.rpc("remove_list_item", {
			p_list_id: listId,
			p_user_id: user.id,
			p_tmdb_id: parseInt(tmdbId),
		});

		if (error) {
			if (error.code === "P0001") {
				// Custom error (unauthorized)
				return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
			}
			throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing item:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to remove item" }, { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: RouteParams) {
	try {
		const { user, error: authError } = await checkAuthenticatedApi();
		if (authError) return authError;

		const resolvedParams = await params;
		const listId = resolvedParams.id;
		const updates = await request.json();

		const supabase = await createClient();

		// Call the RPC function
		const { error } = await supabase.rpc("update_list_items_order", {
			p_list_id: listId,
			p_user_id: user.id,
			p_updates: updates,
		});

		if (error) {
			if (error.code === "P0001") {
				// Custom error (unauthorized)
				return NextResponse.json({ error: "Unauthorized to modify this list" }, { status: 403 });
			}
			throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating item orders:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update item orders" }, { status: 500 });
	}
}
