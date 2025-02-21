// src/components/profile/ActivityFeed.tsx
'use client';
import { motion } from 'framer-motion';
import { Star, Tv2, List, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

interface Activity {
	id: string;
	type: 'WATCHED' | 'REVIEWED' | 'CREATED_LIST';
	show?: string;
	timestamp: Date;
	rating?: number | null;
	content?: string;
	title?: string;
	showCount?: number;
}

interface ActivityFeedProps {
	activities: Activity[];
	className?: string;
}

export function ActivityFeed({ activities, className = '' }: ActivityFeedProps) {
	const getActivityIcon = (type: Activity['type']) => {
		switch (type) {
			case 'WATCHED':
				return Tv2;
			case 'REVIEWED':
				return MessageSquare;
			case 'CREATED_LIST':
				return List;
			default:
				return Star;
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6 shadow-xl backdrop-blur-lg">
				<h2 className="mb-4 text-xl font-black uppercase tracking-wider text-gray-800">Recent Activity</h2>

				<div className="space-y-4">
					{activities.map((activity, index) => (
						<motion.div
							key={activity.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="group relative"
						>
							<div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 blur transition group-hover:opacity-50" />
							<div className="relative flex items-start gap-4 rounded-lg border border-white/50 bg-white/90 p-4 backdrop-blur-lg">
								<div className="mt-1">
									{React.createElement(getActivityIcon(activity.type), {
										className: 'h-5 w-5 text-purple-500',
									})}
								</div>
								<div className="flex-1">
									<div className="mb-1 font-bold text-gray-900">
										{activity.type === 'WATCHED' && `Watched ${activity.show}`}
										{activity.type === 'REVIEWED' && `Reviewed ${activity.show}`}
										{activity.type === 'CREATED_LIST' && `Created list "${activity.title}"`}
									</div>
									{activity.content && <p className="text-sm text-gray-600">{activity.content}</p>}
									{activity.rating && (
										<div className="mt-1 flex items-center gap-1">
											<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
											<span className="text-sm font-medium">{activity.rating}</span>
										</div>
									)}
									<div className="mt-2 text-xs text-gray-500">
										{formatDistanceToNow(activity.timestamp, { addSuffix: true })}
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
