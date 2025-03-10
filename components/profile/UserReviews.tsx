// /components/profile/UserReviews.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Star, Filter, ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getTMDBImageUrl } from "@/config/tmdb";

interface UserReviewsProps {
	username: string;
	reviews: Array<{
		id: string;
		content: string;
		rating: number | null;
		created_at: string;
		tmdb_id: number | null;
		parent_tmdb_id: number | null;
		content_type: string;
		contains_spoilers: boolean | null;
	}>;
	isOwnProfile: boolean;
}

interface ShowDetails {
	id: number;
	name: string;
	poster_path: string | null;
}

interface EpisodeDetails {
	id: number;
	name: string;
	episode_number: number;
	season_number: number;
	still_path: string | null;
}

export function UserReviews({ username, reviews, isOwnProfile }: UserReviewsProps) {
	const [filter, setFilter] = useState<"all" | "shows" | "episodes">("all");
	const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");
	const [showFilters, setShowFilters] = useState(false);
	const [showDetails, setShowDetails] = useState<Record<number, ShowDetails>>({});
	const [episodeDetails, setEpisodeDetails] = useState<Record<number, EpisodeDetails>>({});

	// Fetch show and episode details
	useEffect(() => {
		async function fetchDetails() {
			const uniqueShowIds = new Set<number>();
			const episodeToShowMap = new Map<number, number>(); // Map episode IDs to their show IDs

			// Collect all unique IDs
			reviews.forEach((review) => {
				if (review.content_type === "show" && review.tmdb_id) {
					uniqueShowIds.add(review.tmdb_id);
				} else if (review.content_type === "episode" && review.parent_tmdb_id) {
					uniqueShowIds.add(review.parent_tmdb_id);
					if (review.tmdb_id) {
						episodeToShowMap.set(review.tmdb_id, review.parent_tmdb_id);
					}
				}
			});

			// Fetch show details
			const showPromises = Array.from(uniqueShowIds).map(async (id) => {
				const response = await fetch(`/api/shows/${id}`);
				if (!response.ok) return null;
				const data = await response.json();
				return { id, details: data.show };
			});

			// Fetch episode details with their parent show IDs
			const episodePromises = Array.from(episodeToShowMap.entries()).map(async ([episodeId, showId]) => {
				const response = await fetch(`/api/episodes/${episodeId}?showId=${showId}`);
				if (!response.ok) return null;
				const data = await response.json();
				return { id: episodeId, details: data.episode };
			});

			const showResults = await Promise.all(showPromises);
			const episodeResults = await Promise.all(episodePromises);

			const showMap: Record<number, ShowDetails> = {};
			const episodeMap: Record<number, EpisodeDetails> = {};

			showResults.forEach((result) => {
				if (result) {
					showMap[result.id] = result.details;
				}
			});

			episodeResults.forEach((result) => {
				if (result) {
					episodeMap[result.id] = result.details;
				}
			});

			setShowDetails(showMap);
			setEpisodeDetails(episodeMap);
		}

		fetchDetails();
	}, [reviews]);

	const filteredReviews = reviews.filter((review) => {
		if (filter === "all") return true;
		return review.content_type === filter;
	});

	const sortedReviews = [...filteredReviews].sort((a, b) => {
		if (sortBy === "recent") {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		}
		return (b.rating ?? 0) - (a.rating ?? 0);
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href={`/profiles/${username}`} className="rounded-full bg-white/90 p-2 transition hover:bg-white">
						<ArrowLeft className="h-6 w-6 text-gray-600" />
					</Link>
					<h1 className="text-2xl font-black tracking-wider">{isOwnProfile ? "Your Reviews" : `${username}'s Reviews`}</h1>
				</div>

				<button
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-bold text-purple-600 hover:bg-purple-200"
				>
					<Filter className="h-4 w-4" />
					Filters
				</button>
			</div>

			{/* Filters */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="rounded-xl border-4 border-white/50 bg-white/90 p-4">
							<div className="grid gap-4 sm:grid-cols-2">
								{/* Content Type Filter */}
								<div>
									<h3 className="mb-2 font-bold text-gray-700">Content Type</h3>
									<div className="flex gap-2">
										{(["all", "shows", "episodes"] as const).map((type) => (
											<button
												key={type}
												onClick={() => setFilter(type)}
												className={`rounded-full px-4 py-2 font-bold ${
													filter === type
														? "bg-purple-500 text-white"
														: "bg-purple-100 text-purple-600 hover:bg-purple-200"
												}`}
											>
												{type.charAt(0).toUpperCase() + type.slice(1)}
											</button>
										))}
									</div>
								</div>

								{/* Sort Options */}
								<div>
									<h3 className="mb-2 font-bold text-gray-700">Sort By</h3>
									<div className="flex gap-2">
										<button
											onClick={() => setSortBy("recent")}
											className={`flex items-center gap-1 rounded-full px-4 py-2 font-bold ${
												sortBy === "recent"
													? "bg-purple-500 text-white"
													: "bg-purple-100 text-purple-600 hover:bg-purple-200"
											}`}
										>
											<Clock className="h-4 w-4" />
											Most Recent
										</button>
										<button
											onClick={() => setSortBy("rating")}
											className={`flex items-center gap-1 rounded-full px-4 py-2 font-bold ${
												sortBy === "rating"
													? "bg-purple-500 text-white"
													: "bg-purple-100 text-purple-600 hover:bg-purple-200"
											}`}
										>
											<Star className="h-4 w-4" />
											Highest Rated
										</button>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Reviews List */}
			<div className="space-y-4">
				{sortedReviews.map((review) => {
					const show = review.content_type === "episode" ? showDetails[review.parent_tmdb_id!] : showDetails[review.tmdb_id!];
					const episode = review.content_type === "episode" ? episodeDetails[review.tmdb_id!] : null;

					return (
						<motion.div
							key={review.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-xl border-4 border-white/50 bg-white/90 p-6"
						>
							{/* Media Info */}
							<div className="mb-4 flex items-start gap-4">
								{/* Show/Episode Image */}
								<Link
									href={`/shows/${review.content_type === "episode" ? review.parent_tmdb_id : review.tmdb_id}`}
									className="flex-shrink-0"
								>
									<div className="h-24 w-16 overflow-hidden rounded-lg">
										<img
											src={
												getTMDBImageUrl(
													review.content_type === "episode"
														? episode?.still_path || show?.poster_path
														: show?.poster_path,
													"poster",
													"small"
												)!
											}
											alt={show?.name}
											className="h-full w-full object-cover"
										/>
									</div>
								</Link>

								{/* Show/Episode Details */}
								<div className="flex-1">
									<Link
										href={`/shows/${review.content_type === "episode" ? review.parent_tmdb_id : review.tmdb_id}`}
										className="hover:text-purple-600"
									>
										<h3 className="font-bold text-lg">{show?.name}</h3>
									</Link>
									{episode && (
										<p className="text-gray-600">
											S{episode.season_number} E{episode.episode_number}: {episode.name}
										</p>
									)}
								</div>
							</div>

							{/* Review Details */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex items-baseline gap-2">
										<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
										<span className="text-xl font-bold">{review.rating ? review.rating.toFixed(1) : "N/A"}</span>
									</div>
									<div className="text-sm text-gray-500">{formatDistanceToNow(new Date(review.created_at))} ago</div>
								</div>
								{review.contains_spoilers && (
									<span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
										Contains Spoilers
									</span>
								)}
							</div>

							{/* Review Content */}
							<p className="mt-4 font-mono text-gray-700">{review.content}</p>
						</motion.div>
					);
				})}

				{sortedReviews.length === 0 && (
					<div className="rounded-xl border-4 border-white/50 bg-white/90 p-8 text-center">
						<p className="text-gray-600">
							{isOwnProfile ? "You haven't written any reviews yet!" : `${username} hasn't written any reviews yet!`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default UserReviews;
