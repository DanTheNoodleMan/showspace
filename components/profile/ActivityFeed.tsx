// src/components/profile/ActivityFeed.tsx
"use client";
import { motion } from "framer-motion";
import { Star, Tv2, List, MessageSquare, PlayCircle } from "lucide-react";
import { getTMDBImageUrl } from "@/config/tmdb";
import React from "react";
import Link from "next/link";

interface Activity {
	id: string;
	type: "WATCHED" | "REVIEWED" | "CREATED_LIST";
	show?: string;
	show_name?: string;
	timestamp: Date;
	rating?: number | null;
	content?: string;
	title?: string;
	showCount?: number;
	season_number?: number;
	episode_number?: number;
	poster_path?: string;
}

interface ActivityFeedProps {
	activities: Activity[];
	className?: string;
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

export function ActivityFeed({ activities, className = "" }: ActivityFeedProps) {
	const getActivityIcon = (type: Activity["type"]) => {
		switch (type) {
			case "WATCHED":
				return Tv2;
			case "REVIEWED":
				return MessageSquare;
			case "CREATED_LIST":
				return List;
			default:
				return Star;
		}
	};

	console.log("Activities:", activities);

	const renderActivityContent = (activity: Activity) => {
		switch (activity.type) {
			case "WATCHED":
				return (
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						{activity.poster_path && (
							<div className="w-24 h-36 sm:w-16 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-purple-100">
								{activity.poster_path ? (
									<img
										src={getTMDBImageUrl(activity.poster_path, "poster", "large")!}
										alt={activity.show_name || "Episode"}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<PlayCircle className="w-8 h-8 text-purple-400" />
									</div>
								)}
							</div>
						)}
						<div className="flex-1">
							<Link
								href={`/shows/${activity.show}`}
								className="text-lg font-bold text-gray-900 hover:text-purple-600 transition line-clamp-1"
							>
								{activity.show_name}
							</Link>
							<div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
								<span className="flex items-center gap-1">
									<PlayCircle className="w-4 h-4" />
									Season {activity.season_number} • Episode {activity.episode_number}
								</span>
							</div>
						</div>
					</div>
				);
			case "REVIEWED":
				return (
					<>
						<div className="mb-1 font-bold text-gray-900">Reviewed {activity.show_name}</div>
						{activity.content && <p className="text-sm text-gray-600 line-clamp-2">{activity.content}</p>}
					</>
				);
			case "CREATED_LIST":
				return (
					<div className="mb-1 font-bold text-gray-900">
						Created list "{activity.title}"
						{activity.showCount && <span className="ml-2 text-sm text-gray-600">({activity.showCount} shows)</span>}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6 shadow-xl backdrop-blur-lg">
				<h2 className="mb-4 text-xl font-black uppercase tracking-wider text-gray-800">Recent Activity</h2>

				<div className="space-y-4">
					{activities.map((activity, index) => (
						<motion.div
							key={activity.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="group relative"
						>
							<div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 blur transition group-hover:opacity-50" />
							<div className="relative flex items-start gap-4 rounded-lg border border-white/50 bg-white/90 p-4 backdrop-blur-lg">
								<div className="mt-1">
									{React.createElement(getActivityIcon(activity.type), {
										className: "h-5 w-5 text-purple-500",
									})}
								</div>
								<div className="flex-1">
									{renderActivityContent(activity)}
									{activity.content && <p className="text-sm text-gray-600">{activity.content}</p>}
									{activity.rating && (
										<div className="mt-1 flex items-center gap-1">
											<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
											<span className="text-sm font-medium">{activity.rating}</span>
										</div>
									)}
									<div className="mt-2 text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
