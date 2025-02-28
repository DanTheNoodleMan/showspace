'use client';

import { useState } from 'react';
import { UserPlus, UserMinus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface User {
	id: string;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	isFollowing: boolean;
}

interface ConnectionsProps {
	profile: {
		username: string;
		display_name: string | null;
	};
	followers: User[];
	following: User[];
	isOwnProfile: boolean;
	initialTab: 'followers' | 'following';
}

export function Connections({ profile, followers, following, isOwnProfile, initialTab }: ConnectionsProps) {
	const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
	const [connections, setConnections] = useState<{
		followers: User[];
		following: User[];
	}>({ followers, following });

	const router = useRouter();
	const { user } = useAuth();

	const handleFollowToggle = async (userToToggle: User) => {
		if (!user) {
			router.push(`/login?redirectTo=/profiles/${profile.username}/connections`);
			return;
		}

		try {
			const response = await fetch(`/api/profiles/${userToToggle.username}/follow`, {
				method: userToToggle.isFollowing ? 'DELETE' : 'POST',
			});

			if (response.ok) {
				// Update both followers and following lists
				setConnections((prev) => ({
					followers: prev.followers.map((u) => (u.id === userToToggle.id ? { ...u, isFollowing: !u.isFollowing } : u)),
					following: prev.following.map((u) => (u.id === userToToggle.id ? { ...u, isFollowing: !u.isFollowing } : u)),
				}));
			}
		} catch (error) {
			console.error('Error toggling follow:', error);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href={`/profiles/${profile.username}`} className="rounded-full bg-white/90 p-2 transition hover:bg-white">
					<ArrowLeft className="h-6 w-6 text-gray-600" />
				</Link>
				<h1 className="text-2xl font-black tracking-wider">
					{profile.display_name || profile.username}'s {activeTab === 'followers' ? 'Followers' : 'Following'}
				</h1>
			</div>

			{/* Tabs */}
			<div className="rounded-lg border-2 border-purple-300 bg-white/90 p-1">
				<div className="grid grid-cols-2 gap-1">
					<button
						onClick={() => setActiveTab('followers')}
						className={`rounded-md px-4 py-2 font-bold transition cursor-pointer ${
							activeTab === 'followers' ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'
						}`}
					>
						Followers ({connections.followers.length})
					</button>
					<button
						onClick={() => setActiveTab('following')}
						className={`rounded-md px-4 py-2 font-bold transition cursor-pointer ${
							activeTab === 'following' ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'
						}`}
					>
						Following ({connections.following.length})
					</button>
				</div>
			</div>

			{/* Users List */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-xl border-4 border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-lg"
			>
				<div className="space-y-2">
					{(activeTab === 'followers' ? connections.followers : connections.following).map((connection) => (
						<div key={connection.id} className="flex items-center justify-between rounded-lg p-2 transition hover:bg-purple-50">
							<Link href={`/profiles/${connection.username}`} className="flex flex-1 items-center gap-3">
								<div className="h-12 w-12 overflow-hidden rounded-full bg-purple-100">
									{connection.avatar_url ? (
										<img src={connection.avatar_url} alt={connection.username} className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full w-full items-center justify-center text-xl font-bold text-purple-500">
											{connection.username[0].toUpperCase()}
										</div>
									)}
								</div>
								<div>
									<div className="font-bold text-gray-900">{connection.display_name || connection.username}</div>
									<div className="text-sm text-gray-500">@{connection.username}</div>
								</div>
							</Link>

							{user && user.id !== connection.id && (
								<button
									onClick={() => handleFollowToggle(connection)}
									className={`ml-2 flex items-center gap-1 rounded-full px-4 py-2 font-bold transition ${
										connection.isFollowing
											? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
											: 'bg-purple-500 text-white hover:bg-purple-600'
									}`}
								>
									{connection.isFollowing ? (
										<>
											<UserMinus className="h-4 w-4" />
											Unfollow
										</>
									) : (
										<>
											<UserPlus className="h-4 w-4" />
											Follow
										</>
									)}
								</button>
							)}
						</div>
					))}

					{(activeTab === 'followers' ? connections.followers : connections.following).length === 0 && (
						<div className="py-8 text-center text-gray-500">No {activeTab} yet</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}
