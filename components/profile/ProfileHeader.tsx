'use client';

import { Star, Clapperboard, ListChecks, Trophy, UserPlus, UserMinus, Loader2, Edit } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ProfileHeaderProps {
	profile: {
		username: string;
		created_at: string;
		avatar_url: string | null;
		bio: string | null;
	};
	stats: {
		showsWatched: number;
		totalEpisodes: number;
		listsCreated: number;
		followers: number;
		following: number;
		reviewsWritten: number;
		currentStreak: number;
	};
	isOwnProfile: boolean;
	isFollowing: boolean;
}

export function ProfileHeader({ profile, stats, isOwnProfile, isFollowing }: ProfileHeaderProps) {
	const [followLoading, setFollowLoading] = useState(false);
	const [currentlyFollowing, setCurrentlyFollowing] = useState(isFollowing);
	const router = useRouter();
	const { user } = useAuth();

	const handleFollowToggle = async () => {
		if (!user) {
			router.push(`/login?redirectTo=/profiles/${profile.username}`);
			return;
		}

		setFollowLoading(true);
		try {
			const response = await fetch(`/api/profiles/${profile.username}/follow`, {
				method: currentlyFollowing ? 'DELETE' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to update follow status');
			}

			setCurrentlyFollowing(!currentlyFollowing);
			router.refresh(); // Refresh the page to update follower count
		} catch (error) {
			console.error('Error updating follow status:', error);
		} finally {
			setFollowLoading(false);
		}
	};

	return (
		<div className="relative overflow-hidden rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8 shadow-xl backdrop-blur-lg">
			<div className="absolute inset-0 bg-grid-white/25" />

			<div className="relative flex flex-col items-center gap-6 md:flex-row md:gap-8">
				{/* Avatar Circle */}
				<div className="group relative h-32 w-32">
					<div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
					<div className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-white/50 bg-white/90 text-4xl font-black uppercase tracking-wider">
						{profile.avatar_url ? (
							<img src={profile.avatar_url} alt={profile.username} className="h-full w-full rounded-full object-cover" />
						) : (
							profile.username[0]
						)}
					</div>
				</div>

				{/* User Info */}
				<div className="flex flex-1 flex-col text-center md:text-left">
					<div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
						<div>
							<h1 className="mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl md:text-4xl font-black uppercase tracking-wider text-transparent">
								{profile.username}
							</h1>
							<p className="mb-4 font-mono text-gray-600">
								Joined {new Date(profile.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short' })}
							</p>
						</div>

						{/* Action Buttons */}
						{!isOwnProfile ? (
							<button
								onClick={handleFollowToggle}
								disabled={followLoading}
								className={`group relative overflow-hidden rounded-lg p-0.5 focus:outline-none cursor-pointer ${
									currentlyFollowing
										? 'bg-red-500 hover:bg-red-600'
										: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500'
								}`}
							>
								<span
									className={`relative flex items-center gap-2 rounded-md px-4 py-2 font-bold transition ${
										currentlyFollowing
											? 'text-white'
											: 'bg-white text-gray-900 group-hover:bg-transparent group-hover:text-white'
									}`}
								>
									{followLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : currentlyFollowing ? (
										<UserMinus className="h-4 w-4" />
									) : (
										<UserPlus className="h-4 w-4" />
									)}
									{followLoading ? 'Loading...' : currentlyFollowing ? 'Unfollow' : 'Follow'}
								</span>
							</button>
						) : (
							<Link
								href="/settings"
								className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none"
							>
								<span className="relative flex items-center gap-2 rounded-md bg-white px-4 py-2 font-bold text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
									<Edit className="h-4 w-4" />
									Edit Profile
								</span>
							</Link>
						)}
					</div>

					{/* Bio if exists */}
					{profile.bio && <p className="mb-4 font-mono text-gray-700">{profile.bio}</p>}

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
						<div className="flex items-center gap-2">
							<Trophy className="h-5 w-5 text-purple-500" />
							<span className="font-bold">Streak: {stats.currentStreak}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
