// /app/api/episodes/[id]/route.ts
import { NextResponse } from "next/server";
import { TMDB_CONFIG } from "@/config/tmdb";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		// Extract show ID from the path or query
		const showId = request.url.includes("?") ? new URL(request.url).searchParams.get("showId") : null;

		if (!showId) {
			return NextResponse.json({ error: "Show ID is required" }, { status: 400 });
		}

		// Fetch episode details from TMDB
		const response = await fetch(`${TMDB_CONFIG.baseUrl}/tv/${showId}/episode/${params.id}?api_key=${TMDB_CONFIG.apiToken}`, {
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch episode details");
		}

		const data = await response.json();

		return NextResponse.json({
			episode: {
				id: data.id,
				name: data.name,
				overview: data.overview,
				episode_number: data.episode_number,
				season_number: data.season_number,
				still_path: data.still_path,
				air_date: data.air_date,
				runtime: data.runtime,
			},
		});
	} catch (error) {
		console.error("Error fetching episode details:", error);
		return NextResponse.json({ error: "Failed to fetch episode details" }, { status: 500 });
	}
}
