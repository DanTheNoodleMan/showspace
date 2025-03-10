// /components/shows/EpisodeReviews.tsx
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Eye, ThumbsUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// Database response type
interface ReviewResponse {
	id: string;
	user_id: string;
	content: string;
	rating: number | null;
	contains_spoilers: boolean | null;
	created_at: string;
	likes_count: number | null;
	content_type: string;
	tmdb_id: number;
	parent_tmdb_id: number | null;
	profiles: {
		username: string;
		avatar_url: string | null;
	};
}

// Processed Review type
interface Review {
	id: string;
	user_id: string;
	content: string;
	rating: number;
	contains_spoilers: boolean;
	created_at: string;
	likes_count: number;
	user: {
		username: string;
		avatar_url: string | null;
	};
	has_liked: boolean;
}

interface EpisodeReviewsProps {
	showId: number;
	episodeId: number;
}

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years > 0) return `${years}y ago`;
	if (months > 0) return `${months}mo ago`;
	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "just now";
}

function processReview(review: ReviewResponse, hasLiked: boolean = false): Review {
	return {
		id: review.id,
		user_id: review.user_id,
		content: review.content,
		rating: (review.rating || 0),
		contains_spoilers: review.contains_spoilers || false,
		created_at: review.created_at,
		likes_count: review.likes_count || 0,
		user: {
			username: review.profiles.username,
			avatar_url: review.profiles.avatar_url,
		},
		has_liked: hasLiked,
	};
}

export function EpisodeReviews({ showId, episodeId }: EpisodeReviewsProps) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);
	const { user } = useAuth();
	const supabase = createClient();

	useEffect(() => {
		async function fetchReviews() {
			try {
				const { data: rawData, error } = await supabase
					.from("reviews")
					.select(
						`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `
					)
					.eq("tmdb_id", episodeId)
					.eq("content_type", "episode")
					.order("created_at", { ascending: false });

				if (error) throw error;

				const reviewsData = rawData as ReviewResponse[];

				// Get liked reviews if user is logged in
				const likedReviewIds = new Set<string>();
				if (user) {
					const { data: likedReviews } = await supabase.from("review_likes").select("review_id").eq("user_id", user.id);

					likedReviews?.forEach((lr) => likedReviewIds.add(lr.review_id));
				}

				// Process reviews
				const processedReviews = reviewsData
					.filter((review) => review.rating !== null) // Filter out reviews without ratings
					.map((review) => processReview(review, likedReviewIds.has(review.id)));

				setReviews(processedReviews);
			} catch (err) {
				console.error("Error fetching reviews:", err);
				setError("Failed to load reviews");
			} finally {
				setLoading(false);
			}
		}

		fetchReviews();
	}, [episodeId, user]);

	const handleLikeReview = async (reviewId: string, currentlyLiked: boolean) => {
		if (!user) return; // Handle unauthorized state

		try {
			if (currentlyLiked) {
				// Unlike
				await supabase.from("review_likes").delete().eq("user_id", user.id).eq("review_id", reviewId);
			} else {
				// Like
				await supabase.from("review_likes").insert({ user_id: user.id, review_id: reviewId });
			}

			// Update local state
			setReviews(
				reviews.map((review) => {
					if (review.id === reviewId) {
						return {
							...review,
							likes_count: currentlyLiked ? review.likes_count - 1 : review.likes_count + 1,
							has_liked: !currentlyLiked,
						};
					}
					return review;
				})
			);
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	if (loading) {
		return (
			<div className="animate-pulse space-y-4">
				{[1, 2].map((i) => (
					<div key={i} className="rounded-lg bg-purple-50 p-4">
						<div className="h-4 w-1/4 bg-purple-100 rounded"></div>
						<div className="mt-2 h-12 w-full bg-purple-100 rounded"></div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg bg-red-50 p-4 text-red-600">
				<AlertTriangle className="mb-2 h-5 w-5" />
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Reviews Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-gray-800">Reviews ({reviews.length})</h3>
				<button
					onClick={() => setExpanded(!expanded)}
					className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-600 hover:bg-purple-200"
				>
					{expanded ? (
						<>
							<ChevronUp className="h-4 w-4" />
							Show Less
						</>
					) : (
						<>
							<ChevronDown className="h-4 w-4" />
							Show All
						</>
					)}
				</button>
			</div>

			{/* Reviews List */}
			<AnimatePresence>
				<div className="space-y-4">
					{reviews.slice(0, expanded ? undefined : 2).map((review, index) => (
						<motion.div
							key={review.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ delay: index * 0.1 }}
							className="rounded-lg border-2 border-purple-100 bg-white/50 p-4"
						>
							{/* Review Header */}
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-3">
									{/* User Avatar */}
									<div className="h-8 w-8 overflow-hidden rounded-full bg-purple-100">
										{review.user.avatar_url ? (
											<img
												src={review.user.avatar_url}
												alt={review.user.username}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-sm font-bold text-purple-500">
												{review.user.username[0].toUpperCase()}
											</div>
										)}
									</div>

									{/* Username and Rating */}
									<div>
										<div className="font-bold text-gray-900">{review.user.username}</div>
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
											{review.rating}/5 • {formatTimeAgo(new Date(review.created_at))}
										</div>
									</div>
								</div>

								{/* Spoiler Warning */}
								{review.contains_spoilers && (
									<div className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
										<Eye className="mr-1 inline-block h-3 w-3" />
										Spoilers
									</div>
								)}
							</div>

							{/* Review Content */}
							<p className="font-mono text-gray-700">{review.content}</p>

							{/* Review Actions */}
							<div className="mt-4 flex items-center gap-4">
								<button
									onClick={() => handleLikeReview(review.id, review.has_liked || false)}
									className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold cursor-pointer ${
										review.has_liked ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}`}
								>
									<ThumbsUp className="h-4 w-4" />
									{review.likes_count}
								</button>
							</div>
						</motion.div>
					))}
				</div>
			</AnimatePresence>
		</div>
	);
}

export default EpisodeReviews;
