"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Star, Tv2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { Show } from "@/types";
import { getTMDBImageUrl } from "@/config/tmdb";

export function ShowSearch() {
	const [query, setQuery] = useState("");
	const [shows, setShows] = useState<Show[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	// Close search results when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const searchShows = debounce(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setShows([]);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(`/api/search/shows?q=${encodeURIComponent(searchQuery)}`);
			const data = await response.json();
			console.log(data);
			setShows(data.popularityOrderedShows);
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
		setIsOpen(true);
		searchShows(value);
	};

	return (
		<div ref={searchRef} className="relative max-w-2xl mx-auto">
			<div className="relative overflow-hidden rounded-full border-4 border-white/50 bg-white/90 shadow-xl backdrop-blur-lg">
				<Search className="absolute left-4 top-3 h-6 w-6 text-purple-400" />
				<input
					type="text"
					value={query}
					onChange={handleSearch}
					onClick={() => setIsOpen(true)}
					placeholder="SEARCH SHOWS..."
					className="w-full bg-transparent px-6 py-3 pl-12 font-bold tracking-wide text-gray-700 placeholder-purple-300 focus:outline-none"
				/>
				{query && (
					<button
						onClick={() => {
							setQuery("");
							setShows([]);
							setIsOpen(false);
						}}
						className="absolute right-4 top-3 rounded-full bg-gray-200 p-1 hover:bg-gray-300"
					>
						<X className="h-4 w-4 text-gray-600" />
					</button>
				)}
			</div>

			<AnimatePresence>
				{isOpen && (query || loading || shows.length > 0) && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute mt-2 w-full rounded-xl border-4 border-white/50 bg-white/90 p-2 shadow-xl backdrop-blur-lg z-50"
					>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
							</div>
						) : shows.length > 0 ? (
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{shows.map((show) => (
									<Link
										key={show.id}
										href={`/shows/${show.id}`}
										className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-purple-50"
									>
										<div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg">
											{show.posterPath ? (
												<img
													src={getTMDBImageUrl(show.posterPath, "poster", "small")!}
													alt={show.title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-purple-100 text-purple-500">
													<Tv2 className="h-6 w-6" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-bold text-gray-900 truncate">{show.title}</div>
											<div className="text-sm text-gray-500">{new Date(show.firstAirDate).getFullYear()}</div>
										</div>
										<div className="flex items-center gap-1 px-2">
											<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
											<span className="font-mono text-sm">{show.rating != 0.0 ? show.rating.toFixed(1) : "N/A"}</span>
										</div>
									</Link>
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
