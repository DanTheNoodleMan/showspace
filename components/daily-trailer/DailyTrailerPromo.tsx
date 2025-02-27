'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Trophy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export function DailyTrailerPromo() {
	const [isLoading, setIsLoading] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const router = useRouter();

	// Handle loading timeout to prevent UI getting stuck
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (isLoading) {
			// If loading takes more than 5 seconds, show the overlay
			timer = setTimeout(() => {
				setShowOverlay(true);
			}, 300); // Show overlay after 300ms for a smoother experience
		}

		return () => {
			clearTimeout(timer);
		};
	}, [isLoading]);

	const handleClick = (e: React.MouseEvent) => {
		if (isLoading) {
			// Prevent navigation if already loading
			e.preventDefault();
			return;
		}

		setIsLoading(true);

		// Prefetch and navigate
		router.prefetch('/daily-trailer');

		// Slight delay before navigation for animation
		setTimeout(() => {
			router.push('/daily-trailer');
		}, 100);
	};

	return (
		<>
			{/* Full-screen loading overlay */}
			<LoadingOverlay isVisible={showOverlay} />

			<motion.div
				onClick={handleClick}
				className={`group relative cursor-pointer overflow-hidden rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 shadow-xl backdrop-blur-lg ${
					isLoading ? 'pointer-events-none' : ''
				}`}
				whileHover={{ scale: isLoading ? 1.0 : 1.02 }}
				whileTap={{ scale: isLoading ? 1.0 : 0.98 }}
			>
				<div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 blur transition-opacity group-hover:opacity-75" />
				<div className="relative flex flex-col items-center gap-6 p-6 md:flex-row">
					{/* Icon Container */}
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg">
						{isLoading ? (
							<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
						) : (
							<Play className="h-8 w-8 text-purple-500" />
						)}
					</div>

					{/* Content */}
					<div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
						<h3 className="text-xl font-black uppercase tracking-wider text-gray-800">DAILY TRAILER CHALLENGE</h3>
						<p className="mt-2 font-mono text-gray-600">
							Watch a mystery trailer and guess its rating. How long can you keep your streak?
						</p>

						{/* Stats */}
						<div className="mt-4 flex gap-6">
							<div className="flex items-center gap-1">
								<Star className="h-5 w-5 text-yellow-500" />
								<span className="font-bold">Rate Movies</span>
							</div>
							<div className="flex items-center gap-1">
								<Trophy className="h-5 w-5 text-purple-500" />
								<span className="font-bold">Win Streaks</span>
							</div>
						</div>
					</div>

					{/* CTA Button */}
					<div className="mt-4 md:mt-0 group-hover:animate-pulse">
						<div className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-1">
							<div className="rounded-full bg-white px-6 py-2 font-bold text-gray-800 transition group-hover:bg-transparent group-hover:text-white">
								{isLoading ? (
									<span className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										LOADING...
									</span>
								) : (
									'PLAY NOW'
								)}
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</>
	);
}
