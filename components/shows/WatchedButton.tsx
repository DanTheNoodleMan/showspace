import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface WatchedButtonProps {
	showId: number;
	seasonId: number;
	episodeId: number;
	initialWatched?: boolean;
	onWatchedChange?: (watched: boolean) => void;
	posterPath: string;
	episodeNumber: number;
	seasonNumber: number;
	showName: string;
}

export default function WatchedButton({
	showId,
	seasonId,
	episodeId,
	initialWatched = false,
	onWatchedChange,
	posterPath,
	episodeNumber,
	seasonNumber,
	showName,
}: WatchedButtonProps) {
	const [isWatched, setIsWatched] = useState(initialWatched);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const router = useRouter();
	const supabase = createClient();

	const handleToggleWatched = async () => {
		if (!user) {
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		setIsLoading(true);

		try {
			if (isWatched) {
				// Remove from watch history
				await supabase
					.from("watch_history")
					.delete()
					.eq("user_id", user.id)
					.eq("show_tmdb_id", showId)
					.eq("season_tmdb_id", seasonId)
					.eq("tmdb_id", episodeId);

				setIsWatched(false);
				if (onWatchedChange) onWatchedChange(false);
			} else {
				// Add to watch history
				await supabase.from("watch_history").insert({
					user_id: user.id,
					show_tmdb_id: showId,
					season_tmdb_id: seasonId,
					tmdb_id: episodeId,
					poster_path: posterPath,
					episode_number: episodeNumber,
					season_number: seasonNumber,
					show_name: showName,
					watched_at: new Date().toISOString(),
				});

				setIsWatched(true);
				if (onWatchedChange) onWatchedChange(true);
			}

			router.refresh();
		} catch (error) {
			console.error("Error updating watch status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleToggleWatched}
			disabled={isLoading}
			className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold transition ${
				isWatched ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-purple-100 text-purple-600 hover:bg-purple-200"
			}`}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Check className={`h-4 w-4 ${isWatched ? "text-green-600" : "text-purple-600"}`} />
			)}
			{isWatched ? "Watched" : "Mark as Watched"}
		</button>
	);
}
