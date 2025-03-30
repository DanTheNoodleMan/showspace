"use client";

import React, { useState } from "react";
import { ListWithItems } from "@/types/lists";
import { User } from "@supabase/supabase-js";
import { ListCreationModal } from "@/components/lists/ListCreationModal";
import { ListCard } from "@/components/lists/ListCard";
import { Plus, Grid, List as ListIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ListsContentProps {
	initialLists: ListWithItems[];
	user: User;
}

export function ListsContent({ initialLists, user }: ListsContentProps) {
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
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-black tracking-wider text-gray-800">MY LISTS</h1>
				<div className="flex items-center gap-4">
					{/* View Toggle */}
					<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-1">
						<div className="flex gap-1">
							<button
								onClick={() => setViewMode("grid")}
								className={`rounded-md p-2 transition ${
									viewMode === "grid" ? "bg-purple-500 text-white" : "text-purple-600 hover:bg-purple-100 cursor-pointer"
								}`}
							>
								<Grid className="h-5 w-5" />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`rounded-md p-2 transition ${
									viewMode === "list" ? "bg-purple-500 text-white" : "text-purple-600 hover:bg-purple-100 cursor-pointer"
								}`}
							>
								<ListIcon className="h-5 w-5" />
							</button>
						</div>
					</div>

					{/* Create List Button */}
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-600 cursor-pointer"
					>
						<Plus className="h-5 w-5" />
						Create List
					</button>
				</div>
			</div>

			{/* Lists Grid */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
				</div>
			) : lists.length === 0 ? (
				<div className="rounded-xl border-4 border-white/50 bg-white/90 p-8 text-center shadow-xl backdrop-blur-lg">
					<h2 className="mb-4 text-xl font-bold text-gray-800">You haven't created any lists yet</h2>
					<p className="mb-6 text-gray-600">Start organizing your favorite shows by creating your first list!</p>
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-bold text-white hover:bg-purple-600"
					>
						<Plus className="h-5 w-5" />
						Create Your First List
					</button>
				</div>
			) : (
				<motion.div layout className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2" : "space-y-4"}>
					{lists.map((list) => (
						<motion.div key={list.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
							<ListCard
								list={list}
								isOwner={true}
								onEdit={() => setEditingList(list)}
								onDelete={() => handleDeleteList(list.id)}
							/>
						</motion.div>
					))}
				</motion.div>
			)}

			{/* Create List Modal */}
			<ListCreationModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateList}
				mode="create"
			/>

			{/* Edit List Modal */}
			<ListCreationModal
				isOpen={!!editingList}
				onClose={() => setEditingList(null)}
				onSubmit={(data) => editingList ? handleEditList(editingList.id, data) : Promise.resolve()}
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
		</div>
	);
}
