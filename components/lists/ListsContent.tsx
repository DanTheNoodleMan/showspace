"use client";

import React, { useState } from "react";
import { ListWithItems } from "@/types/lists";
import { ListCreationModal } from "@/components/lists/ListCreationModal";
import { ListCard } from "@/components/lists/ListCard";
import { Plus, Grid, List as ListIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ListsContentProps {
	initialLists: ListWithItems[];
	profile?: {
		username: string;
		display_name: string | null;
	};
	isReadOnly?: boolean;
	showViewMode?: boolean;
}

export function ListsContent({ initialLists, profile, isReadOnly = false, showViewMode = false }: ListsContentProps) {
	const [lists, setLists] = useState(initialLists);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [editingList, setEditingList] = useState<ListWithItems | null>(null);

	const handleCreateList = async (data: any) => {
		try {
			const response = await fetch("/api/lists", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create list");
			}

			const { list } = await response.json();
			setLists((prev) => [{ ...list, items: [], itemCount: 0 }, ...prev]);
		} catch (error) {
			console.error("Error creating list:", error);
			throw error;
		}
	};

	const handleEditList = async (listId: string, data: any) => {
		try {
			const response = await fetch("/api/lists", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: listId, ...data }),
			});

			if (!response.ok) {
				throw new Error("Failed to update list");
			}

			const { list } = await response.json();
			setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, ...list } : l)));
			setEditingList(null);
		} catch (error) {
			console.error("Error updating list:", error);
			throw error;
		}
	};

	const handleDeleteList = async (listId: string) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this list?");
		if (!confirmDelete) return;

		setLoading(true);
		try {
			const response = await fetch(`/api/lists?id=${listId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete list");
			}

			setLists((prev) => prev.filter((list) => list.id !== listId));
		} catch (error) {
			console.error("Error deleting list:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* View Controls */}
			{showViewMode && (
				<div className="flex items-center justify-end gap-4">
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
			)}

			{/* Header Controls */}
			<div className="flex items-center justify-between gap-4">
				{!isReadOnly && (
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none cursor-pointer"
					>
						<div className="relative flex items-center gap-2 rounded-md bg-white px-4 py-2 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
							<Plus className="h-5 w-5" />
							Create New List
						</div>
					</button>
				)}

				{showViewMode && (
					<div className={`rounded-lg border-2 border-purple-300 bg-white/50 p-1 ${!isReadOnly ? "ml-auto" : ""}`}>
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
				)}
			</div>

			{/* Lists Grid */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
				</div>
			) : lists.length === 0 ? (
				<div className="rounded-xl border-4 border-white/50 bg-white/90 p-8 text-center shadow-xl backdrop-blur-lg">
					<h2 className="mb-4 text-xl font-bold text-gray-800">
						{isReadOnly
							? `${profile?.display_name || profile?.username} hasn't created any lists yet`
							: "You haven't created any lists yet"}
					</h2>
					{!isReadOnly && (
						<>
							<p className="mb-6 text-gray-600">Start organizing your favorite shows by creating your first list!</p>
							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-bold text-white hover:bg-purple-600 cursor-pointer"
							>
								<Plus className="h-5 w-5" />
								Create Your First List
							</button>
						</>
					)}
				</div>
			) : (
				<motion.div layout className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2" : "space-y-4"}>
					{lists.map((list) => (
						<motion.div key={list.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
							<ListCard
								list={list}
								isOwner={!isReadOnly}
								isReadOnly={isReadOnly}
								onEdit={() => setEditingList(list)}
								onDelete={() => handleDeleteList(list.id)}
							/>
						</motion.div>
					))}
				</motion.div>
			)}

			{/* Modals - Only render if not in read-only mode */}
			{!isReadOnly && (
				<>
					<ListCreationModal
						isOpen={isCreateModalOpen}
						onClose={() => setIsCreateModalOpen(false)}
						onSubmit={handleCreateList}
						mode="create"
					/>

					<ListCreationModal
						isOpen={!!editingList}
						onClose={() => setEditingList(null)}
						onSubmit={(data) => (editingList ? handleEditList(editingList.id, data) : Promise.resolve())}
						mode="edit"
						initialData={
							editingList
								? {
										title: editingList.title,
										description: editingList.description || "",
										isPrivate: editingList.is_private || false,
										listType: editingList.list_type as any,
								  }
								: undefined
						}
					/>
				</>
			)}
		</div>
	);
}
