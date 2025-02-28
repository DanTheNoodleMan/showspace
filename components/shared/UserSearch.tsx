'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, UserMinus, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

interface User {
	id: string;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	isFollowing: boolean;
}

export function UserSearch() {
	const [query, setQuery] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [loadingFollows, setLoadingFollows] = useState<{ [key: string]: boolean }>({});
	const searchRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const { user } = useAuth();

	// Close search results when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const searchUsers = debounce(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setUsers([]);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`);
			const data = await response.json();
			setUsers(data.users);
		} catch (error) {
			console.error('Error searching users:', error);
		} finally {
			setLoading(false);
		}
	}, 300);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		setLoading(true);
		setIsOpen(true);
		searchUsers(value);
	};

	const handleFollowToggle = async (userToFollow: User) => {
		if (!user) {
			router.push('/login');
			return;
		}

		setLoadingFollows((prev) => ({ ...prev, [userToFollow.id]: true }));

		try {
			const response = await fetch(`/api/profiles/${userToFollow.username}/follow`, {
				method: userToFollow.isFollowing ? 'DELETE' : 'POST',
			});

			if (response.ok) {
				setUsers(users.map((u) => (u.id === userToFollow.id ? { ...u, isFollowing: !u.isFollowing } : u)));
			}
		} catch (error) {
			console.error('Error toggling follow:', error);
		} finally {
			// Clear loading state for this user
			setLoadingFollows((prev) => ({ ...prev, [userToFollow.id]: false }));
		}
	};

	return (
		<div ref={searchRef} className="relative max-w-2xl">
			<div className="relative overflow-hidden rounded-full border-4 border-white/50 bg-white/90 shadow-xl backdrop-blur-lg">
				<Search className="absolute left-4 top-2 h-6 w-6 text-purple-400" />
				<input
					type="text"
					value={query}
					onChange={handleSearch}
					onClick={() => setIsOpen(true)}
					placeholder="SEARCH USERS..."
					className="w-full bg-transparent px-6 py-2 pl-12 font-bold tracking-wide text-gray-700 placeholder-purple-300 focus:outline-none"
				/>
				{query && (
					<button
						onClick={() => {
							setQuery('');
							setUsers([]);
							setIsOpen(false);
						}}
						className="absolute right-4 top-2 rounded-full bg-gray-200 p-1 hover:bg-gray-300"
					>
						<X className="h-4 w-4 text-gray-600" />
					</button>
				)}
			</div>

			<AnimatePresence>
				{isOpen && (query || loading || users.length > 0) && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute mt-2 w-full rounded-xl border-4 border-white/50 bg-white/90 p-2 shadow-xl backdrop-blur-lg"
					>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
							</div>
						) : users.length > 0 ? (
							<div className="space-y-2">
								{users.map((searchedUser) => (
									<div
										key={searchedUser.id}
										className="flex items-center justify-between rounded-lg p-2 hover:bg-purple-50"
									>
										<Link href={`/profiles/${searchedUser.username}`} className="flex flex-1 items-center gap-3">
											<div className="h-10 w-10 overflow-hidden rounded-full bg-purple-100">
												{searchedUser.avatar_url ? (
													<img
														src={searchedUser.avatar_url}
														alt={searchedUser.username}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-lg font-bold text-purple-500">
														{searchedUser.username[0].toUpperCase()}
													</div>
												)}
											</div>
											<div>
												<div className="font-bold text-gray-900">
													{searchedUser.display_name || searchedUser.username}
												</div>
												<div className="text-sm text-gray-500">@{searchedUser.username}</div>
											</div>
										</Link>
										{user && user.id !== searchedUser.id && (
											<button
												onClick={() => handleFollowToggle(searchedUser)}
												disabled={loadingFollows[searchedUser.id]}
												className={`ml-2 flex items-center gap-1 rounded-full px-4 py-2 font-bold transition ${
													searchedUser.isFollowing
														? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
														: 'bg-purple-500 text-white hover:bg-purple-600'
												} ${loadingFollows[searchedUser.id] ? 'opacity-75' : ''}`}
											>
												{loadingFollows[searchedUser.id] ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : searchedUser.isFollowing ? (
													<>
														<UserMinus className="h-4 w-4" />
														<span className="hidden sm:block">Unfollow</span>
													</>
												) : (
													<>
														<UserPlus className="h-4 w-4" />
														<span className="hidden sm:block">Follow</span>
													</>
												)}
											</button>
										)}
									</div>
								))}
							</div>
						) : query ? (
							<div className="py-8 text-center text-gray-500">No users found</div>
						) : null}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
