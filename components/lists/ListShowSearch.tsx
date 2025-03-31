"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Star, Tv2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { getTMDBImageUrl } from "@/config/tmdb";
import { useToast } from "@/components/ui/toast";

interface ListShowSearchProps {
	listId: string;
	onClose: () => void;
	onShowAdded: (newItem: any) => void;
}

export function ListShowSearch({ listId, onClose, onShowAdded }: ListShowSearchProps) {
	const [query, setQuery] = useState("");
	const [shows, setShows] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(true);
	const [addingShows, setAddingShows] = useState<Set<number>>(new Set());
	const searchRef = useRef<HTMLDivElement>(null);
	const { showToast } = useToast();

	const searchShows = debounce(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setShows([]);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(`/api/search/shows?q=${encodeURIComponent(searchQuery)}`);
			const data = await response.json();
			setShows(data.popularityOrderedShows || []);
		} catch (error) {
			console.error("Error searching shows:", error);
		} finally {
			setLoading(false);
		}
	}, 300);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		setLoading(true);
		searchShows(value);
	};

	const handleAddShow = async (tmdbId: number, showData: any) => {
		if (addingShows.has(tmdbId)) return;

		setAddingShows((prev) => new Set(prev).add(tmdbId));

		try {
			const response = await fetch(`/api/lists/${listId}/items`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tmdb_id: tmdbId,
					content_type: "show",
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to add show");
			}

			const data = await response.json();

			// Combine the list item data with the show data
			const enhancedListItem = {
				...data.listItem,
				show: {
					name: showData.title,
					poster_path: showData.posterPath,
					first_air_date: showData.firstAirDate,
					vote_average: showData.rating,
				},
			};

			showToast("Show added to list", "success");
			onShowAdded(enhancedListItem);
		} catch (error) {
			console.error("Error adding show:", error);
			showToast(error instanceof Error ? error.message : "Failed to add show", "error");
		} finally {
			setAddingShows((prev) => {
				const next = new Set(prev);
				next.delete(tmdbId);
				return next;
			});
		}
	};

	return (
		<div ref={searchRef} className="relative w-full">
			<div className="relative overflow-hidden rounded-full border-4 border-white/50 bg-white/90 shadow-xl backdrop-blur-lg">
				<Search className="absolute left-4 top-3 h-6 w-6 text-purple-400" />
				<input
					type="text"
					value={query}
					onChange={handleSearch}
					placeholder="SEARCH SHOWS..."
					className="w-full bg-transparent px-6 py-3 pl-12 font-bold tracking-wide text-gray-700 placeholder-purple-300 focus:outline-none"
					autoFocus
				/>
				{query && (
					<button
						onClick={() => {
							setQuery("");
							setShows([]);
						}}
						className="absolute right-4 top-3 rounded-full bg-gray-200 p-1 hover:bg-gray-300"
					>
						<X className="h-4 w-4 text-gray-600" />
					</button>
				)}
			</div>

			<AnimatePresence>
				{(query || loading || shows.length > 0) && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute mt-2 w-full rounded-xl border-4 border-white/50 bg-white/90 p-2 shadow-xl backdrop-blur-lg"
					>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
							</div>
						) : shows.length > 0 ? (
							<div className="max-h-96 space-y-2 overflow-y-auto">
								{shows.map((show) => (
									<div key={show.id} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-purple-50">
										<div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg">
											{show.posterPath ? (
												<img
													src={getTMDBImageUrl(show.posterPath, "poster", "small")!}
													alt={show.title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-purple-100">
													<Tv2 className="h-6 w-6 text-purple-500" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0 truncate">
											<div className="font-bold text-gray-900 truncate">{show.title}</div>
											<div className="text-sm text-gray-500">{new Date(show.firstAirDate).getFullYear()}</div>
										</div>
										<button
											onClick={() => handleAddShow(show.id, show)}
											disabled={addingShows.has(show.id)}
											className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 font-bold text-purple-600 hover:bg-purple-200 disabled:opacity-50 cursor-pointer"
										>
											{addingShows.has(show.id) ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Plus className="h-4 w-4" />
											)}
											<span className="hidden sm:block">Add</span>
										</button>
									</div>
								))}
							</div>
						) : query ? (
							<div className="py-8 text-center text-gray-500">No shows found</div>
						) : null}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
