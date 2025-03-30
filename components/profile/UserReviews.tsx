"use client";

import React, { useState, useEffect } from "react";
import { Star, ArrowLeft, Tv2, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getTMDBImageUrl } from "@/config/tmdb";

interface Review {
	id: string;
	content: string;
	rating: number | null;
	created_at: string;
	tmdb_id: number | null;
	parent_tmdb_id: number | null;
	content_type: string;
	contains_spoilers: boolean | null;
	season_number: number | null;
	episode_number: number | null;
}

interface EpisodeDetails {
	name: string;
	seasonNumber: number;
	episodeNumber: number;
}

interface ShowDetails {
	id: number;
	name: string;
	poster_path: string | null;
}

interface GroupedReviews {
	[showId: string]: {
		show: ShowDetails;
		reviews: Review[];
		stats: {
			avgRating: number;
			totalReviews: number;
			episodeReviews: number;
		};
	};
}

interface UserReviewsProps {
	username: string;
	reviews: Review[];
	isOwnProfile: boolean;
}

export function UserReviews({ username, reviews, isOwnProfile }: UserReviewsProps) {
	const [episodeDetails, setEpisodeDetails] = useState<Record<string, EpisodeDetails>>({});
	const [groupedReviews, setGroupedReviews] = useState<GroupedReviews>({});
	const [expandedShows, setExpandedShows] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(true);

	// Group reviews and fetch show/episode details
	useEffect(() => {
		async function fetchData() {
			try {
				// First, group reviews by show and fetch show details
				const groups: GroupedReviews = {};
				const showFetches = new Set<number>();
				const episodeFetches: { reviewId: string; params: { showId: number; seasonNum: number; epNum: number } }[] = [];

				// Group reviews and prepare fetches
				reviews.forEach((review) => {
					const showId = review.content_type === "episode" ? review.parent_tmdb_id! : review.tmdb_id!;

					if (!groups[showId]) {
						showFetches.add(showId);
						groups[showId] = {
							show: { id: showId, name: "", poster_path: null },
							reviews: [],
							stats: { avgRating: 0, totalReviews: 0, episodeReviews: 0 },
						};
					}

					groups[showId].reviews.push(review);

					if (review.content_type === "episode" && review.season_number && review.episode_number) {
						episodeFetches.push({
							reviewId: review.id,
							params: {
								showId: review.parent_tmdb_id!,
								seasonNum: review.season_number,
								epNum: review.episode_number,
							},
						});
					}
				});

				// Fetch show details
				const showDetails = await Promise.all(
					Array.from(showFetches).map(async (showId) => {
						const response = await fetch(`/api/shows/${showId}`);
						if (!response.ok) return null;
						const data = await response.json();
						return { id: showId, details: data.show };
					})
				);

				// Update groups with show details
				showDetails.forEach((detail) => {
					if (detail && groups[detail.id]) {
						groups[detail.id].show = {
							id: detail.id,
							name: detail.details.name,
							poster_path: detail.details.poster_path,
						};
					}
				});

				// Fetch episode details
				const episodeDetailsMap: Record<string, EpisodeDetails> = {};
				await Promise.all(
					episodeFetches.map(async ({ reviewId, params }) => {
						try {
							const response = await fetch(
								`/api/episodes/${reviewId}?` +
									`showId=${params.showId}&` +
									`seasonNumber=${params.seasonNum}&` +
									`episodeNumber=${params.epNum}`
							);

							if (!response.ok) return;
							const data = await response.json();
							episodeDetailsMap[reviewId] = data.episode;
						} catch (error) {
							console.error("Error fetching episode:", error);
						}
					})
				);

				// Calculate stats for each show
				Object.values(groups).forEach((group) => {
					const ratings = group.reviews.map((r) => r.rating || 0).filter((r) => r > 0);
					group.stats = {
						avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
						totalReviews: group.reviews.length,
						episodeReviews: group.reviews.filter((r) => r.content_type === "episode").length,
					};
				});

				setGroupedReviews(groups);
				setEpisodeDetails(episodeDetailsMap);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [reviews]);

	const toggleShowExpanded = (showId: string) => {
		setExpandedShows((prev) => {
			const next = new Set(prev);
			if (next.has(showId)) {
				next.delete(showId);
			} else {
				next.add(showId);
			}
			return next;
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="animate-pulse h-8 w-48 bg-purple-100 rounded"></div>
				<div className="animate-pulse h-32 w-full bg-purple-100 rounded"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href={`/profiles/${username}`} className="rounded-full bg-white/90 p-2 transition hover:bg-white">
					<ArrowLeft className="h-6 w-6 text-gray-600" />
				</Link>
				<h1 className="text-2xl font-black tracking-wider">{isOwnProfile ? "Your Reviews" : `${username}'s Reviews`}</h1>
			</div>

			{/* Grouped Reviews */}
			<div className="space-y-4">
				{Object.entries(groupedReviews).map(([showId, { show, reviews, stats }]) => (
					<div key={showId} className="rounded-xl border-4 border-white/50 bg-white/90 overflow-hidden">
						{/* Show Header */}
						<div className="p-6 cursor-pointer hover:bg-purple-50 transition-colors" onClick={() => toggleShowExpanded(showId)}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="h-24 w-16 overflow-hidden rounded-lg">
										<img
											src={getTMDBImageUrl(show.poster_path, "poster", "small")!}
											alt={show.name}
											className="h-full w-full object-cover"
										/>
									</div>
									<div>
										<Link
											href={`/shows/${showId}`}
											className="text-xl font-bold hover:text-purple-600"
											onClick={(e) => e.stopPropagation()}
										>
											{show.name}
										</Link>
										<div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Star className="h-4 w-4 text-yellow-400" />
												<span>{stats.avgRating.toFixed(1)}</span>
											</div>
											<div className="flex items-center gap-1 text-purple-500">
												<MessageCircle className="h-4 w-4" />
												<span>{stats.totalReviews} reviews</span>
											</div>
											{stats.episodeReviews > 0 && (
												<div className="flex items-center gap-1 text-purple-500">
													<Tv2 className="h-4 w-4" />
													<span>{stats.episodeReviews} episodes</span>
												</div>
											)}
										</div>
									</div>
								</div>
								<motion.div animate={{ rotate: expandedShows.has(showId) ? 180 : 0 }} transition={{ duration: 0.2 }}>
									<ChevronDown className="h-6 w-6 text-purple-500" />
								</motion.div>
							</div>
						</div>

						{/* Reviews List */}
						<AnimatePresence>
							{expandedShows.has(showId) && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="overflow-hidden border-t-2 border-purple-100"
								>
									<div className="space-y-4 p-6">
										{reviews.map((review) => (
											<div key={review.id} className="rounded-lg bg-white/80 p-4 shadow-sm">
												{/* Episode Info */}
												{review.content_type === "episode" && episodeDetails[review.id] && (
													<div className="mb-3 flex items-center gap-2 text-purple-600">
														<Tv2 className="h-4 w-4" />
														<span>
															Season {episodeDetails[review.id].seasonNumber} • Episode{" "}
															{episodeDetails[review.id].episodeNumber} • {episodeDetails[review.id].name}
														</span>
													</div>
												)}

												{/* Rating and Date */}
												<div className="mb-3 flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="flex items-baseline gap-2">
															<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
															<span className="text-xl font-bold">
																{review.rating ? review.rating.toFixed(1) : "N/A"}
															</span>
														</div>
														<div className="text-sm text-gray-500">
															{formatDistanceToNow(new Date(review.created_at))} ago
														</div>
													</div>
													{review.contains_spoilers && (
														<span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
															Contains Spoilers
														</span>
													)}
												</div>

												{/* Review Content */}
												<p className="font-mono text-gray-700">{review.content}</p>
											</div>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				))}

				{Object.keys(groupedReviews).length === 0 && (
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
