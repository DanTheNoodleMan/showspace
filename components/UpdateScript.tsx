import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TMDB_CONFIG } from "@/config/tmdb";

export default function UpdateWatchHistory() {
	const [isUpdating, setIsUpdating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<any>(null);

	const getTMDBToken = async () => {
		const response = await fetch("/api/tmdb/token");
		if (!response.ok) {
			throw new Error("Failed to get TMDB token");
		}
		const data = await response.json();
		return data.token;
	};

	const updateHistory = async () => {
		setIsUpdating(true);
		setError(null);
		const supabase = createClient();

		try {
			// Get TMDB token first
			const tmdbToken = await getTMDBToken();

			if (!tmdbToken) {
				throw new Error("Failed to get TMDB token");
			}

			// // First, let's get all unique show IDs to minimize API calls
			// const { data: shows, error: showError } = await supabase
			// 	.from("watch_history")
			// 	.select("show_tmdb_id, season_tmdb_id")
			// 	.is("show_name", null);

			// if (showError) throw showError;

			// console.log("Found shows to update:", shows);

			// Get all watch history records
			const { data: watchHistory, error: fetchError } = await supabase.from("watch_history").select("*");

			if (fetchError) throw fetchError;

			console.log("Total records to update:", watchHistory.length);
			let updated = 0;

			// Update each record
			for (const record of watchHistory) {
				try {
					console.log("Processing record:", record);

					// Get show seasons first
					const showResponse = await fetch(
						`${TMDB_CONFIG.baseUrl}/tv/${record.show_tmdb_id}?language=${TMDB_CONFIG.defaultLanguage}`,
						{
							headers: {
								Authorization: `Bearer ${tmdbToken}`,
								Accept: "application/json",
							},
						}
					);

					if (!showResponse.ok) {
						console.error("Error fetching show:", await showResponse.text());
						continue;
					}

					const showData = await showResponse.json();
					console.log("Show data:", showData);

					// Get season details
					const seasonResponse = await fetch(
						`${TMDB_CONFIG.baseUrl}/tv/${record.show_tmdb_id}/season/${showData.seasons[0].season_number}?language=${TMDB_CONFIG.defaultLanguage}`,
						{
							headers: {
								Authorization: `Bearer ${tmdbToken}`,
								Accept: "application/json",
							},
						}
					);

					if (!seasonResponse.ok) {
						console.error("Error fetching season:", await seasonResponse.text());
						continue;
					}

					const seasonData = await seasonResponse.json();
					console.log("Season data:", seasonData);

					// Update the record with the season information
					const { data, error: updateError } = await supabase
						.from("watch_history")
						.update({
							season_number: seasonData.season_number,
							episode_number: seasonData.episodes[0].episode_number,
							poster_path: seasonData.episodes[0].still_path,
                            show_name: showData.name,
						})
						.eq("id", record.id);

					console.log("Updated record:", data);

					if (updateError) {
						console.error("Error updating record:", updateError);
						throw updateError;
					}

					updated++;
					setProgress(Math.floor((updated / watchHistory.length) * 100));
					console.log(`Updated ${updated}/${watchHistory.length} records`);
				} catch (error) {
					console.error(`Error updating record ${record.id}:`, error);
					continue; // Continue with next record even if one fails
				}
			}

			alert(`Updated ${updated} of ${watchHistory.length} records`);
		} catch (error) {
			console.error("Update error:", error);
			setError(error instanceof Error ? error.message : "An unknown error occurred");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="p-4 rounded-lg border-2 border-purple-200 bg-white/90">
			<h2 className="text-xl font-bold mb-4">Update Watch History</h2>

			{error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

			{isUpdating ? (
				<div className="space-y-2">
					<div className="h-2 w-full bg-purple-100 rounded-full">
						<div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
					</div>
					<p className="text-sm text-gray-600">Updating records... {progress}%</p>
				</div>
			) : (
				<button
					onClick={updateHistory}
					className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition cursor-pointer"
				>
					Update Missing Fields
				</button>
			)}
		</div>
	);
}
