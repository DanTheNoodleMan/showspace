// /components/profile/ProfileHeader.tsx
'use client';
import { User } from '@supabase/supabase-js';
import { Star, Clapperboard, ListChecks } from 'lucide-react';

interface ProfileHeaderProps {
	user: User;
	stats: {
		showsWatched: number;
		totalEpisodes: number;
		listsCreated: number;
		followers: number;
		following: number;
		reviewsWritten: number;
	};
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
	return (
		<div className="relative overflow-hidden rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8 shadow-xl backdrop-blur-lg">
			<div className="absolute inset-0 bg-grid-white/25" />

			<div className="relative flex flex-col items-center gap-6 md:flex-row md:gap-8">
				{/* Avatar Circle */}
				<div className="group relative h-32 w-32">
					<div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
					<div className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-white/50 bg-white/90 text-4xl font-black uppercase tracking-wider">
						{user.email?.[0]}
					</div>
				</div>

				{/* User Info */}
				<div className="text-center md:text-left flex flex-col">
					<h1 className="mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl md:text-4xl font-black uppercase tracking-wider text-transparent">
						{user.user_metadata.username}
					</h1>
					<p className="mb-4 font-mono text-gray-600">Joined {new Date(user.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short' })}</p>

					{/* Quick Stats */}
					<div className="flex flex-wrap justify-center gap-6 md:justify-start">
						<div className="flex items-center gap-2">
							<Clapperboard className="h-5 w-5 text-purple-500" />
							<span className="font-bold">{stats.showsWatched} Shows</span>
						</div>
						<div className="flex items-center gap-2">
							<Star className="h-5 w-5 text-purple-500" />
							<span className="font-bold">{stats.reviewsWritten} Reviews</span>
						</div>
						<div className="flex items-center gap-2">
							<ListChecks className="h-5 w-5 text-purple-500" />
							<span className="font-bold">{stats.listsCreated} Lists</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
