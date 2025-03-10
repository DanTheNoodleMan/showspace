// /components/shows/EpisodeRating.tsx
import React, { useState, useRef } from "react";
import { Star, MessageSquare, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface EpisodeRatingProps {
	showId: number;
	episodeId: number;
	episodeNumber: number;
	seasonNumber: number;
	initialRating?: number; // Stored as 0-5 in database
	initialReview?: {
		content: string;
		contains_spoilers: boolean;
	};
}

export function EpisodeRating({ showId, episodeId, episodeNumber, seasonNumber, initialRating, initialReview }: EpisodeRatingProps) {
	const [rating, setRating] = useState<number>(initialRating || 0);
	const [hoverRating, setHoverRating] = useState<number>(0);
	const [isReviewOpen, setIsReviewOpen] = useState(false);
	const [review, setReview] = useState(initialReview?.content || "");
	const [containsSpoilers, setContainsSpoilers] = useState(initialReview?.contains_spoilers || false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const starContainerRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();
	const router = useRouter();
	const supabase = createClient();

	const calculateStarRating = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!starContainerRef.current) return 0;

		const containerRect = starContainerRef.current.getBoundingClientRect();
		const starWidth = containerRect.width / 5; // Width of one star
		const relativeX = e.clientX - containerRect.left;
		const starIndex = Math.floor(relativeX / starWidth);
		const starPosition = (relativeX % starWidth) / starWidth;

		// Calculate rating (0-5)
		let newRating = starIndex;
		if (starPosition > 0.5) {
			newRating += 1;
		} else if (starPosition > 0) {
			newRating += 0.5;
		}

		return Math.max(0, Math.min(5, newRating));
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const newRating = calculateStarRating(e);
		setHoverRating(newRating);
	};

	const handleMouseLeave = () => {
		setHoverRating(0);
	};

	const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
		if (!user) {
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		const newRating = calculateStarRating(e);
		handleRatingSubmit(newRating);
	};

	const handleRatingSubmit = async (newRating: number) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const { error: upsertError } = await supabase.from("reviews").upsert(
				{
					user_id: user!.id,
					tmdb_id: episodeId,
					parent_tmdb_id: showId,
					content_type: "episode",
					season_number: seasonNumber,
					episode_number: episodeNumber,
					content: review,
					rating: newRating, // Store directly as 0-5
					contains_spoilers: containsSpoilers,
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: "user_id,tmdb_id,content_type",
				}
			);

			if (upsertError) throw upsertError;
			setRating(newRating);
		} catch (err) {
			console.error("Error submitting rating:", err);
			setError("Failed to submit rating. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReviewSubmit = async () => {
		if (!user) {
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const { error: upsertError } = await supabase.from("reviews").upsert(
				{
					user_id: user.id,
					tmdb_id: episodeId,
					parent_tmdb_id: showId,
					content_type: "episode",
					season_number: seasonNumber,
					episode_number: episodeNumber,
					content: review,
					rating: rating,
					contains_spoilers: containsSpoilers,
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: "user_id,tmdb_id,content_type",
				}
			);

			if (upsertError) throw upsertError;
			setIsReviewOpen(false);
		} catch (err) {
			console.error("Error submitting review:", err);
			setError("Failed to submit review. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render stars based on rating value (0-5)
	const renderStars = (displayRating: number) => {
		return Array.from({ length: 5 }, (_, index) => {
			const isHalfStar = displayRating - index > 0 && displayRating - index < 1;
			const isFullStar = displayRating - index >= 1;

			return (
				<div key={index} className="relative">
					<Star
						className={`h-8 w-8 transition-colors ${
							isFullStar
								? "fill-yellow-400 text-yellow-400"
								: isHalfStar
								? "fill-yellow-200 text-yellow-400"
								: "text-gray-300"
						}`}
					/>
				</div>
			);
		});
	};

	return (
		<div className="space-y-4">
			{/* Rating Display */}
			<div className="flex items-center gap-4">
				{/* Star Rating */}
				<div
					ref={starContainerRef}
					className="flex items-center gap-1 cursor-pointer"
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
				>
					{renderStars(hoverRating || rating)}
				</div>

				{/* Rating Value */}
				{rating > 0 && <div className="text-lg font-bold text-gray-700">{rating.toFixed(1)} stars</div>}
			</div>

			{/* Review Button */}
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => setIsReviewOpen(!isReviewOpen)}
				className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-600 hover:bg-purple-200 cursor-pointer"
			>
				<MessageSquare className="h-4 w-4" />
				{review ? "Edit Review" : "Add Review"}
			</motion.button>

			{/* Review Form */}
			<AnimatePresence>
				{isReviewOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="rounded-lg border-2 border-purple-200 bg-white/50 p-4">
							{/* Spoiler Toggle */}
							<div className="mb-4 flex items-center gap-2">
								<button
									type="button"
									onClick={() => setContainsSpoilers(!containsSpoilers)}
									className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold cursor-pointer ${
										containsSpoilers ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
									}`}
								>
									{containsSpoilers ? (
										<>
											<Eye className="h-4 w-4" />
											Contains Spoilers
										</>
									) : (
										<>
											<EyeOff className="h-4 w-4" />
											No Spoilers
										</>
									)}
								</button>
							</div>

							{/* Review Text Area */}
							<textarea
								value={review}
								onChange={(e) => setReview(e.target.value)}
								placeholder="Write your review..."
								className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-3 focus:border-purple-400 focus:outline-none"
								rows={4}
							/>

							{error && (
								<div className="mt-2 flex items-center gap-2 text-sm text-red-600">
									<AlertTriangle className="h-4 w-4" />
									{error}
								</div>
							)}

							<div className="mt-4 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsReviewOpen(false)}
									className="rounded-lg border-2 border-purple-200 px-4 py-2 font-bold text-purple-600 hover:bg-purple-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleReviewSubmit}
									disabled={isSubmitting}
									className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-600 disabled:opacity-50 cursor-pointer"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Review"
									)}
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default EpisodeRating;
