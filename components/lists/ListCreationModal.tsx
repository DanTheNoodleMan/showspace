import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Globe, Loader2 } from "lucide-react";
import { CreateListInput, ListType } from "@/types/lists";

interface ListCreationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateListInput) => Promise<void>;
	initialData?: Partial<CreateListInput>;
	mode?: "create" | "edit";
}

export function ListCreationModal({ isOpen, onClose, onSubmit, initialData, mode = "create" }: ListCreationModalProps) {
	const [formData, setFormData] = useState<CreateListInput>({
		title: initialData?.title || "",
		description: initialData?.description || "",
		isPrivate: initialData?.isPrivate || false,
		listType: initialData?.listType || "custom",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await onSubmit(formData);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						className="relative z-10 w-full max-w-lg rounded-xl border-4 border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-lg"
					>
						{/* Close Button */}
						<button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 cursor-pointer">
							<X className="h-5 w-5" />
						</button>

						{/* Title */}
						<h2 className="mb-6 text-2xl font-black tracking-wider">{mode === "create" ? "Create New List" : "Edit List"}</h2>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Title Input */}
							<div>
								<label htmlFor="title" className="mb-1 block font-bold text-gray-700">
									TITLE
								</label>
								<input
									type="text"
									id="title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-2 focus:border-purple-400 focus:outline-none"
									required
								/>
							</div>

							{/* Description Input */}
							<div>
								<label htmlFor="description" className="mb-1 block font-bold text-gray-700">
									DESCRIPTION (OPTIONAL)
								</label>
								<textarea
									id="description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-2 focus:border-purple-400 focus:outline-none"
									rows={3}
								/>
							</div>

							{/* Privacy Toggle */}
							<div>
								<label className="mb-1 block font-bold text-gray-700">PRIVACY</label>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => setFormData({ ...formData, isPrivate: false })}
										className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
											!formData.isPrivate
												? "bg-purple-500 text-white"
												: "border-2 border-purple-200 text-gray-600 hover:bg-purple-50 cursor-pointer"
										}`}
									>
										<Globe className="h-4 w-4" />
										Public
									</button>
									<button
										type="button"
										onClick={() => setFormData({ ...formData, isPrivate: true })}
										className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
											formData.isPrivate
												? "bg-purple-500 text-white"
												: "border-2 border-purple-200 text-gray-600 hover:bg-purple-50 cursor-pointer"
										}`}
									>
										<Lock className="h-4 w-4" />
										Private
									</button>
								</div>
							</div>

							{/* Error Message */}
							{error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">{error}</div>}

							{/* Submit Button */}
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={onClose}
									className="rounded-lg border-2 border-purple-200 px-6 py-2 font-bold text-purple-600 hover:bg-purple-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-2 font-bold text-white hover:bg-purple-600 disabled:opacity-50 cursor-pointer"
								>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{mode === "create" ? "Create List" : "Save Changes"}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
