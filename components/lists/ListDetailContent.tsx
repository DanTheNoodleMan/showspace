"use client";

import React, { useState } from "react";
import { ListWithItems } from "@/types/lists";
import { ListShowSearch } from "./ListShowSearch";
import { ArrowLeft, ListPlus, Lock, Grid, List as ListIcon, Settings, GripVertical, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { getTMDBImageUrl } from "@/config/tmdb";
import { ListCreationModal } from "./ListCreationModal";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface ListDetailContentProps {
	list: ListWithItems;
	isOwner: boolean;
	username: string;
}

export function ListDetailContent({ list: initialList, isOwner, username }: ListDetailContentProps) {
	const [list, setList] = useState(initialList);
	const [isEditing, setIsEditing] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const { showToast } = useToast();

	const handleEditList = async (data: any) => {
		try {
			const response = await fetch("/api/lists", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: list.id, ...data }),
			});

			if (!response.ok) throw new Error("Failed to update list");

			const { list: updatedList } = await response.json();
			setList((prev) => ({ ...prev, ...updatedList }));
			showToast("List updated successfully", "success");
		} catch (error) {
			console.error("Error updating list:", error);
			showToast("Failed to update list", "error");
		}
	};

	const handleRemoveItem = async (tmdbId: number) => {
		try {
			const response = await fetch(`/api/lists/${list.id}/items?tmdbId=${tmdbId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to remove item");

			setList((prev) => ({
				...prev,
				items: prev.items.filter((item) => item.tmdb_id !== tmdbId),
				itemCount: prev.itemCount - 1,
			}));
			showToast("Show removed from list", "success");
		} catch (error) {
			console.error("Error removing item:", error);
			showToast("Failed to remove show", "error");
		}
	};

	const handleReorder = async (reorderedItems: typeof list.items) => {
		// Optimistically update the UI
		setList((prev) => ({
			...prev,
			items: reorderedItems,
		}));

		try {
			// Prepare the updates array with new order values
			const updates = reorderedItems.map((item, index) => ({
				tmdb_id: item.tmdb_id,
				order: index,
			}));

			// Send the updates to the server
			const response = await fetch(`/api/lists/${list.id}/items`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update item order");
			}
		} catch (error) {
			console.error("Error updating item order:", error);
			showToast("Failed to update item order", "error");

			// Revert to the original order on error
			setList((prev) => ({
				...prev,
				items: [...prev.items].sort((a, b) => (a.order || 0) - (b.order || 0)),
			}));
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Link
					href={`/profiles/${username}/lists`}
					className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 p-0.5 focus:outline-none"
				>
					<div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors group-hover:bg-transparent">
						<ArrowLeft className="h-6 w-6 text-gray-600 transition-colors group-hover:text-white" />
					</div>
				</Link>

				<div>
					<h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl md:text-3xl font-black tracking-wider text-transparent">
						{list.title}
					</h1>
					{list.description && <p className="mt-1 text-gray-600">{list.description}</p>}
				</div>

				{list.is_private && <Lock className="h-5 w-5 text-gray-500" />}
				{isOwner && (
					<div className="ml-auto flex items-center gap-2">
						<button
							onClick={() => setIsSearchOpen(true)}
							className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none cursor-pointer"
						>
							<div className="relative flex items-center gap-2 rounded-md bg-white px-4 py-2 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
								<ListPlus className="h-5 w-5" />
								<p className="hidden md:block">Add Shows</p>
							</div>
						</button>
						<button
							onClick={() => setIsEditing(true)}
							className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 p-0.5 focus:outline-none cursor-pointer"
						>
							<div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors group-hover:bg-transparent">
								<Settings className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white" />
							</div>
						</button>
					</div>
				)}
			</div>

			{/* Description */}
			{list.description && <p className="text-gray-600">{list.description}</p>}

			{/* View Controls */}
			<div className="flex items-center justify-between gap-4">
				<div className="text-sm text-gray-500">
					{list.itemCount} {list.itemCount === 1 ? "show" : "shows"}
					{isOwner && viewMode === "grid" && (
						<span className="ml-2 text-purple-500 hidden md:inline">(Switch to list view for easier reordering)</span>
					)}
				</div>
				{/* Hide view controls on mobile */}
				<div className="hidden md:block">
					<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-1">
						<div className="flex gap-1">
							<button
								onClick={() => setViewMode("grid")}
								className={`rounded-md p-2 transition cursor-pointer ${
									viewMode === "grid" ? "bg-purple-500 text-white" : "text-purple-600 hover:bg-purple-100"
								}`}
							>
								<Grid className="h-5 w-5" />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`rounded-md p-2 transition cursor-pointer ${
									viewMode === "list" ? "bg-purple-500 text-white" : "text-purple-600 hover:bg-purple-100"
								}`}
							>
								<ListIcon className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Shows Grid/List - Force list view on mobile */}
			<Reorder.Group
				axis="y"
				values={list.items}
				onReorder={handleReorder}
				className={
					viewMode === "grid" && window.innerWidth >= 768 ? "hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
				}
			>
				<AnimatePresence>
					{list.items.map((item) => (
						<Reorder.Item
							key={item.tmdb_id}
							value={item}
							whileDrag={{
								scale: 1.02,
								boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
								cursor: "grabbing",
							}}
							className={`${
								!isOwner ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
							} transition-shadow hover:shadow-md`}
						>
							<motion.div
								layout
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="group relative"
							>
								<div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
								<div className="relative flex items-center gap-4 rounded-lg border-2 border-white/50 bg-white/90 p-4">
									{isOwner && (
										<div className="flex items-center">
											<GripVertical className="h-6 w-6 text-gray-400 md:h-5 md:w-5" />
										</div>
									)}
									<Link href={`/shows/${item.tmdb_id}`} className="flex flex-1 items-center gap-4 truncate">
										<div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg md:h-20 md:w-14">
											{item.show?.poster_path ? (
												<img
													src={getTMDBImageUrl(item.show.poster_path, "poster", "small")!}
													alt={item.show.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-purple-100">
													<Grid className="h-6 w-6 text-purple-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-gray-900 truncate text-sm md:text-md">{item.show?.name}</h3>
											<p className="text-sm text-gray-500">
												{item.show?.first_air_date ? new Date(item.show.first_air_date).getFullYear() : "N/A"}
											</p>
										</div>
									</Link>
									{isOwner && (
										<button
											onClick={() => handleRemoveItem(item.tmdb_id)}
											className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
										>
											<X className="h-6 w-6 md:h-5 md:w-5" />
										</button>
									)}
								</div>
							</motion.div>
						</Reorder.Item>
					))}
				</AnimatePresence>
			</Reorder.Group>
			{/* Empty State */}
			{list.items.length === 0 && (
				<div className="rounded-xl border-4 border-white/50 bg-white/90 p-8 text-center">
					<p className="text-gray-600">{isOwner ? "Start adding shows to your list!" : "This list is empty."}</p>
					{isOwner && (
						<button
							onClick={() => setIsSearchOpen(true)}
							className="mt-4 rounded-lg bg-purple-500 px-6 py-3 font-bold text-white hover:bg-purple-600"
						>
							Add Your First Show
						</button>
					)}
				</div>
			)}

			{/* Search Modal */}
			{isSearchOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-xl border-4 border-white/50 bg-white/90 p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-bold">Add Shows to List</h2>
							<button onClick={() => setIsSearchOpen(false)} className="rounded-full p-2 hover:bg-gray-100 cursor-pointer">
								<X className="h-5 w-5" />
							</button>
						</div>
						<ListShowSearch
							listId={list.id}
							onClose={() => setIsSearchOpen(false)}
							onShowAdded={(newItem) => {
								setList((prev) => ({
									...prev,
									items: [...prev.items, newItem],
									itemCount: prev.itemCount + 1,
								}));
								setIsSearchOpen(false);
							}}
						/>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			<ListCreationModal
				isOpen={isEditing}
				onClose={() => setIsEditing(false)}
				onSubmit={handleEditList}
				mode="edit"
				initialData={{
					title: list.title,
					description: list.description || "",
					isPrivate: list.is_private || false,
					listType: list.list_type as any,
				}}
			/>
		</div>
	);
}
