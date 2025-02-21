// src/components/profile/StatsGrid.tsx
'use client';
import { motion } from 'framer-motion';
import { Trophy, Users, ListChecks, Star, Tv2, PlayCircle } from 'lucide-react';

interface StatsGridProps {
	stats: {
		showsWatched: number;
		totalEpisodes: number;
		listsCreated: number;
		followers: number;
		following: number;
		reviewsWritten: number;
	};
	className?: string;
}

export function StatsGrid({ stats, className = '' }: StatsGridProps) {
	const statItems = [
		{ icon: Tv2, label: 'Shows Watched', value: stats.showsWatched },
		{ icon: PlayCircle, label: 'Episodes', value: stats.totalEpisodes },
		{ icon: ListChecks, label: 'Lists Created', value: stats.listsCreated },
		{ icon: Users, label: 'Followers', value: stats.followers },
		{ icon: Users, label: 'Following', value: stats.following },
		{ icon: Star, label: 'Reviews', value: stats.reviewsWritten },
	];

	return (
		<div className={`grid grid-cols-2 gap-4 ${className}`}>
			{statItems.map((item, index) => (
				<motion.div
					key={item.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
					className="group relative"
				>
					<div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
					<div className="relative flex flex-col items-center h-full rounded-lg border-2 border-white/50 bg-white/90 p-4 backdrop-blur-lg">
						<item.icon className="mb-2 h-6 w-6 text-purple-500" />
						<span className="mb-1 text-2xl font-bold">{item.value}</span>
						<span className="text-sm font-medium text-gray-600 text-center">{item.label}</span>
					</div>
				</motion.div>
			))}
		</div>
	);
}
