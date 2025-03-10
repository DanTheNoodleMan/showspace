// /app/api/episodes/[id]/route.ts
import { NextResponse } from "next/server";
import { tmdbService } from "@/services/tmdb";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const { searchParams } = new URL(request.url);
		const resolvedParams = await params;

		const showId = parseInt(searchParams.get("showId") || "0");
		const seasonNumber = parseInt(searchParams.get("seasonNumber") || "0");
		const episodeNumber = parseInt(searchParams.get("episodeNumber") || "0");

		if (!showId || !seasonNumber || !episodeNumber) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		const episode = await tmdbService.getEpisodeDetails(showId, seasonNumber, episodeNumber);

		return NextResponse.json({
			episode: {
				name: episode.name,
				seasonNumber,
				episodeNumber,
			},
		});
	} catch (error) {
		console.error("Error fetching episode:", error);
		return NextResponse.json({ error: "Failed to fetch episode" }, { status: 500 });
	}
}
