'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play } from 'lucide-react';

interface LoadingOverlayProps {
	isVisible: boolean;
	text?: string;
}

export function LoadingOverlay({ isVisible, text = 'Loading Daily Trailer...' }: LoadingOverlayProps) {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100"
				>
					<div className="flex flex-col items-center gap-4 rounded-xl border-4 border-white/50 bg-white/90 p-8 shadow-xl backdrop-blur-lg">
						<div className="relative h-16 w-16">
							<motion.div
								className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400"
								animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.9, 0.7] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<div className="absolute inset-1 flex items-center justify-center rounded-full bg-white">
								<Play className="h-8 w-8 text-purple-500" />
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
							<span className="text-lg font-bold text-gray-800">{text}</span>
						</div>
						<div className="text-sm text-gray-600">Preparing your daily challenge...</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
