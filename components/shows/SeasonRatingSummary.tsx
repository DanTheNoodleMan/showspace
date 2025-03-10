// /components/shows/SeasonRatingSummary.tsx
import React, { useState, useEffect } from "react";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SeasonRatingSummaryProps {
	showId: number;
	seasonId: number;
	episodeIds: number[];
}

interface RatingSummary {
	averageRating: number;
	totalReviews: number;
	highestRatedEpisode: {
		episodeId: number;
		rating: number;
		episodeNumber: number;
	} | null;
	reviewCount: number;
}

export function SeasonRatingSummary({ showId, seasonId, episodeIds }: SeasonRatingSummaryProps) {
	const [summary, setSummary] = useState<RatingSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		async function fetchRatingSummary() {
			try {
				// Get all reviews for episodes in this season
				const { data: reviews, error } = await supabase
					.from("reviews")
					.select("tmdb_id, rating")
					.in("tmdb_id", episodeIds)
					.eq("content_type", "episode");

				if (error) throw error;

				if (!reviews.length) {
					setSummary({
						averageRating: 0,
						totalReviews: 0,
						highestRatedEpisode: null,
						reviewCount: 0,
					});
					return;
				}

				// Calculate average rating
				const validRatings = reviews.filter((r) => r.rating !== null);
				const averageRating = validRatings.reduce((acc, curr) => acc + (curr.rating ?? 0), 0) / validRatings.length;

				// Find highest rated episode
				const episodeRatings = episodeIds.map((epId) => {
					const episodeReviews = reviews.filter((r) => r.tmdb_id === epId);
					const avgRating = episodeReviews.reduce((acc, curr) => acc + (curr.rating ?? 0), 0) / episodeReviews.length;
					return {
						episodeId: epId,
						rating: avgRating || 0,
						episodeNumber: episodeIds.indexOf(epId) + 1,
					};
				});

				const highestRatedEpisode = episodeRatings.reduce((prev, curr) => (curr.rating > prev.rating ? curr : prev), {
					episodeId: 0,
					rating: 0,
					episodeNumber: 0,
				});

				setSummary({
					averageRating: averageRating || 0,
					totalReviews: reviews.length,
					highestRatedEpisode,
					reviewCount: reviews.filter((r) => r.rating !== null).length,
				});
			} catch (error) {
				console.error("Error fetching rating summary:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchRatingSummary();
	}, [showId, seasonId, episodeIds, supabase]);

	if (loading) {
		return (
			<div className="animate-pulse space-y-2">
				<div className="h-6 w-24 rounded bg-purple-100"></div>
				<div className="h-4 w-32 rounded bg-purple-100"></div>
			</div>
		);
	}

	if (!summary) return null;

	return (
		<div className="rounded-lg border-2 border-purple-200 bg-white/50 p-4">
			<div className="grid grid-cols-2 gap-4">
				{/* Average Rating */}
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Star className="h-5 w-5 text-yellow-400" />
						<span className="font-bold text-gray-700">Average Rating</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-2xl font-bold text-purple-600">{summary.averageRating.toFixed(1)}</span>
						<span className="text-sm text-gray-500">/5</span>
					</div>
				</div>

				{/* Total Reviews */}
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-purple-500" />
						<span className="font-bold text-gray-700">Total Reviews</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-2xl font-bold text-purple-600">{summary.totalReviews}</span>
					</div>
				</div>

				{/* Highest Rated Episode */}
				{summary.highestRatedEpisode && summary.highestRatedEpisode.rating > 0 && (
					<div className="col-span-2 border-t-2 border-purple-100 pt-4">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-green-500" />
							<span className="font-bold text-gray-700">
								Highest Rated: Episode {summary.highestRatedEpisode.episodeNumber}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-2">
							<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
							<span className="font-bold text-purple-600">{summary.highestRatedEpisode.rating.toFixed(1)}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SeasonRatingSummary;
