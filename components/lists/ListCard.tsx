import React from "react";
import { ListWithItems } from "@/types/lists";
import { Lock, Grid, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTMDBImageUrl } from "@/config/tmdb";

interface ListCardProps {
	list: ListWithItems;
	isOwner: boolean;
	isReadOnly?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}

export function ListCard({ list, isOwner, isReadOnly, onEdit, onDelete }: ListCardProps) {
	// Take up to 4 items for the preview
	const previewItems = list.items.slice(0, 4);

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			className="group relative overflow-hidden rounded-xl border-4 border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-lg"
		>
			<div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 blur transition-opacity group-hover:opacity-75" />

			<div className="relative">
				{/* List Header */}
				<div className="mb-4 flex items-center justify-between">
					<Link href={`/lists/${list.id}`} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
						<h3 className="text-xl font-bold">{list.title}</h3>
						{list.is_private && <Lock className="h-4 w-4 text-gray-500" />}
					</Link>

					{isOwner && (
						<div className="flex gap-2">
							<button
								onClick={onEdit}
								className="rounded-full p-2 text-gray-600 hover:bg-purple-100 hover:text-purple-600 cursor-pointer"
							>
								<Pencil className="h-4 w-4" />
							</button>
							<button
								onClick={onDelete}
								className="rounded-full p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 cursor-pointer"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					)}
				</div>

				{/* List Stats */}
				<div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
					<div className="flex items-center gap-1">
						<Grid className="h-4 w-4" />
						<span>{list.itemCount} items</span>
					</div>
					<div className="flex items-center gap-1">
						<Eye className="h-4 w-4" />
						<span>{list.is_private ? "Private" : "Public"}</span>
					</div>
					<div>Updated {formatDistanceToNow(new Date(list.updated_at), { addSuffix: true })}</div>
				</div>

				{/* List Description */}
				{list.description && <p className="mb-4 text-sm text-gray-600">{list.description}</p>}

				{/* Preview Grid */}
				{previewItems.length > 0 && (
					<div className="grid grid-cols-4 gap-2">
						{previewItems.map((item) => (
							<div key={item.tmdb_id} className="aspect-[2/3] overflow-hidden rounded-lg">
								{item.show?.poster_path ? (
									<img
										src={getTMDBImageUrl(item.show.poster_path, "poster", "small")!}
										alt={item.show.name}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-purple-100">
										<Grid className="h-6 w-6 text-purple-400" />
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}
