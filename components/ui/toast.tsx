"use client";
import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info";
}

interface ToastContextType {
	showToast: (message: string, type: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({
	showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const showToast = (message: string, type: Toast["type"]) => {
		const id = Math.random().toString(36).substr(2, 9);
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 3000);
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
				<AnimatePresence>
					{toasts.map((toast) => (
						<motion.div
							key={toast.id}
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.8 }}
							className={`flex items-center justify-between gap-4 rounded-lg border-2 border-white/50 px-4 py-2 shadow-lg backdrop-blur-lg
                ${
					toast.type === "success"
						? "bg-green-100/90 text-green-800"
						: toast.type === "error"
						? "bg-red-100/90 text-red-800"
						: "bg-purple-100/90 text-purple-800"
				}`}
						>
							<span className="font-medium">{toast.message}</span>
							<button
								onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
								className="rounded-full p-1 hover:bg-white/20"
							>
								<X className="h-4 w-4" />
							</button>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}
