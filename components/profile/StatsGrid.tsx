'use client';
import { motion } from 'framer-motion';
import { Trophy, Users, ListChecks, Star, Tv2, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
	username: string;
}

export function StatsGrid({ stats, className = '', username }: StatsGridProps) {
	const statItems = [
		{
			icon: Tv2,
			label: 'Shows Watched',
			value: stats.showsWatched,
			href: "",
		},
		{
			icon: PlayCircle,
			label: 'Episodes',
			value: stats.totalEpisodes,
			href: "",
		},
		{
			icon: ListChecks,
			label: 'Lists Created',
			value: stats.listsCreated,
			href: "",
		},
		{
			icon: Users,
			label: 'Followers',
			value: stats.followers,
			href: `/profiles/${username}/connections?tab=followers`,
		},
		{
			icon: Users,
			label: 'Following',
			value: stats.following,
			href: `/profiles/${username}/connections?tab=following`,
		},
		{
			icon: Star,
			label: 'Reviews',
			value: stats.reviewsWritten,
			href: "",
		},
	];

	return (
		<div className={`grid grid-cols-2 gap-4 ${className}`}>
			{statItems.map((item, index) => (
				<Link href={item.href} key={item.label}>
					<motion.div
						key={item.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className={`group relative ${item.href != "" ? 'cursor-pointer' : ''}`}
					>
						<div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
						<div className="relative flex flex-col items-center h-full rounded-lg border-2 border-white/50 bg-white/90 p-4 backdrop-blur-lg">
							<item.icon className="mb-2 h-6 w-6 text-purple-500" />
							<span className="mb-1 text-2xl font-bold">{item.value}</span>
							<span className="text-sm font-medium text-gray-600 text-center">{item.label}</span>
						</div>
					</motion.div>
				</Link>
			))}
		</div>
	);
}
