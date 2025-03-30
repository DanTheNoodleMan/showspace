import React, { useState, useEffect, useCallback } from "react";
import { ListPlus, Check, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ListWithItems, EnhancedListItem } from "@/types/lists";
import { useToast } from "@/components/ui/toast";

interface QuickAddToListProps {
	showId: number;
	onAdd?: () => void;
	onSuccess?: () => void;
}

export function QuickAddToList({ showId, onAdd, onSuccess }: QuickAddToListProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [lists, setLists] = useState<ListWithItems[]>([]);
	const [loading, setLoading] = useState(false);
	const [addingToLists, setAddingToLists] = useState<Set<string>>(new Set());
	const { user } = useAuth();
	const router = useRouter();
	const { showToast } = useToast();

	const fetchLists = useCallback(async () => {
		if (!user) return;

		setLoading(true);
		try {
			const response = await fetch("/api/lists");
			if (!response.ok) throw new Error("Failed to fetch lists");
			const data = await response.json();
			setLists(data.lists);
		} catch (error) {
			console.error("Error fetching lists:", error);
			showToast("Failed to fetch lists", "error");
		} finally {
			setLoading(false);
		}
	}, [user, showToast]);

	useEffect(() => {
		if (isOpen && user) {
			fetchLists();
		}
	}, [isOpen, user, fetchLists]);

	const handleAddToList = async (listId: string) => {
		if (!user) {
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		// Check if already adding to this list
		if (addingToLists.has(listId)) {
			return;
		}

		// Check if show is already in the list
		const targetList = lists.find((list) => list.id === listId);
		if (targetList?.items.some((item) => item.tmdb_id === showId)) {
			showToast("Show is already in this list", "info");
			return;
		}

		setAddingToLists((prev) => new Set(prev).add(listId));

		try {
			const response = await fetch(`/api/lists/${listId}/items`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tmdb_id: showId,
					content_type: "show",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add to list");
			}

			showToast("Added to list successfully", "success");
			onAdd?.();
			onSuccess?.();

			// Update local state
			setLists((prevLists) =>
				prevLists.map((list) => {
					if (list.id === listId) {
						const newItem: EnhancedListItem = {
							tmdb_id: showId,
							content_type: "show",
							added_at: new Date().toISOString(),
							list_id: listId,
							parent_tmdb_id: null, // Required by the type
							// Include any required fields from EnhancedListItem
							show: undefined, // We don't have show details yet, will be populated on next fetch
						};
						return {
							...list,
							items: [...list.items, newItem],
							itemCount: list.itemCount + 1,
						};
					}
					return list;
				})
			);

			// Refresh the lists to get complete data
			fetchLists();

			// Close the dropdown after successful addition
			setIsOpen(false);
		} catch (error) {
			console.error("Error adding to list:", error);
			showToast(error instanceof Error ? error.message : "Failed to add to list", "error");
		} finally {
			setAddingToLists((prev) => {
				const next = new Set(prev);
				next.delete(listId);
				return next;
			});
		}
	};

	if (!user) {
		return (
			<button
				onClick={() => router.push(`/login?redirectTo=/shows/${showId}`)}
				className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-bold text-purple-600 hover:bg-purple-200 cursor-pointer"
			>
				<ListPlus className="h-4 w-4" />
				Add to List
			</button>
		);
	}

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-bold text-purple-600 hover:bg-purple-200 cursor-pointer"
			>
				<ListPlus className="h-4 w-4" />
				Add to List
			</button>

			<AnimatePresence>
				{isOpen && (
					<>
						{/* Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-40"
							onClick={() => setIsOpen(false)}
						/>

						{/* Dropdown */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border-4 border-white/50 bg-white/90 p-2 shadow-xl backdrop-blur-lg"
						>
							{loading ? (
								<div className="flex items-center justify-center p-4">
									<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
								</div>
							) : lists.length === 0 ? (
								<div className="space-y-2 p-2">
									<p className="text-center text-sm text-gray-500">No lists found</p>
									<button
										onClick={() => router.push("/lists/new")}
										className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-100 p-2 font-bold text-purple-600 hover:bg-purple-200 cursor-pointer"
									>
										<Plus className="h-4 w-4" />
										Create New List
									</button>
								</div>
							) : (
								<div className="max-h-64 space-y-1 overflow-y-auto">
									{lists.map((list) => {
										const isShowInList = list.items.some((item) => item.tmdb_id === showId);
										const isAdding = addingToLists.has(list.id);

										return (
											<button
												key={list.id}
												onClick={() => handleAddToList(list.id)}
												disabled={isAdding || isShowInList}
												className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-purple-50 disabled:opacity-50 cursor-pointer"
											>
												<span className="block truncate font-medium">{list.title}</span>
												<div className="flex h-6 w-6 items-center justify-center">
													{isAdding ? (
														<Loader2 className="h-4 w-4 animate-spin text-purple-500" />
													) : isShowInList ? (
														<Check className="h-4 w-4 text-green-500" />
													) : (
														<Plus className="h-4 w-4 text-purple-500" />
													)}
												</div>
											</button>
										);
									})}
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
