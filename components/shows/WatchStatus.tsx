"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface WatchStatusProps {
	showId: number;
	initialStatus?: string;
	onStatusChange?: (newStatus: string) => void;
}

export function WatchStatus({ showId, initialStatus, onStatusChange }: WatchStatusProps) {
	const [status, setStatus] = useState(initialStatus || "");
	const [isLoading, setIsLoading] = useState(false);
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const supabase = createClient();

	const watchStatusOptions = [
		{ value: "watching", label: "Watching" },
		{ value: "completed", label: "Completed" },
		{ value: "plan to watch", label: "Plan to Watch" },
		{ value: "dropped", label: "Dropped" },
	];

	const handleStatusChange = async (newStatus: string) => {
		// Check authentication first
		if (!user) {
			// Redirect to login if not authenticated
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		setIsLoading(true);
		try {
			const newStatusLower = newStatus.toLowerCase();

			// First, check if a record exists
			const { data: existingStatus } = await supabase
				.from("watch_status")
				.select("status")
				.eq("user_id", user.id)
				.eq("tmdb_id", showId)
				.eq("content_type", "show")
				.single();

			if (existingStatus) {
				if (newStatusLower === existingStatus.status) {
					console.log("Delete:", existingStatus.status, newStatusLower);

					// If clicking the active status again, remove it
					await supabase.from("watch_status").delete().eq("user_id", user.id).eq("tmdb_id", showId).eq("content_type", "show");

					setStatus("");
					if (onStatusChange) onStatusChange("");
				} else {
					console.log("UPDATE:", existingStatus.status, newStatusLower);

					// Update existing status
					await supabase
						.from("watch_status")
						.update({
							status: newStatusLower,
							updated_at: new Date().toISOString(),
						})
						.eq("user_id", user.id)
						.eq("tmdb_id", showId)
						.eq("content_type", "show");

					setStatus(newStatusLower);
					if (onStatusChange) onStatusChange(newStatusLower);
				}
			} else {
				console.log("INSERT:", newStatusLower);

				// Insert new status
				await supabase.from("watch_status").insert({
					user_id: user.id,
					tmdb_id: showId,
					content_type: "show",
					status: newStatusLower,
					updated_at: new Date().toISOString(),
				});

				setStatus(newStatusLower);
				if (onStatusChange) onStatusChange(newStatusLower);
			}
		} catch (error) {
			console.error("Error updating watch status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// While checking auth status
	if (authLoading) {
		return (
			<div className="flex items-center justify-center py-2">
				<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
			</div>
		);
	}
	// If not authenticated, show login prompt
	if (!user) {
		return (
			<div className="rounded-xl border-2 border-purple-300 bg-white/70 p-4">
				<p className="text-center text-gray-700 mb-2">Login to track your watch status</p>
				<button
					onClick={() => router.push(`/login?redirectTo=/shows/${showId}`)}
					className="w-full rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-4 py-2 font-bold text-white hover:opacity-90 transition cursor-pointer"
				>
					Sign in
				</button>
			</div>
		);
	}

	// Authentication status buttons
	return (
		<div className="flex flex-wrap gap-2">
			{isLoading ? (
				<div className="flex w-full items-center justify-center py-2">
					<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
					<span className="ml-2">Updating...</span>
				</div>
			) : (
				<>
					{watchStatusOptions.map((option) => (
						<button
							key={option.value}
							onClick={() => handleStatusChange(option.value)}
							className={`rounded-lg px-4 py-2 font-bold transition cursor-pointer ${
								status === option.value
									? "bg-purple-500 text-white"
									: "border-2 border-purple-300 bg-white/50 text-purple-600 hover:bg-purple-100"
							}`}
						>
							{option.label}
						</button>
					))}
				</>
			)}
		</div>
	);
}
