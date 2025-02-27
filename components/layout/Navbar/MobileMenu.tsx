// components/layout/Navbar/MobileMenu.tsx

import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, Settings, List, ChevronDown, ChevronUp } from 'lucide-react';
import { NavLink } from './NavLink';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MobileMenuProps } from '@/types/navbar';

export function MobileMenu({ isOpen, onToggle, links, user }: MobileMenuProps) {
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	// Close the mobile menu when changing routes
	useEffect(() => {
		if (isOpen) {
			const handleRouteChange = () => {
				onToggle();
			};

			window.addEventListener('popstate', handleRouteChange);
			return () => {
				window.removeEventListener('popstate', handleRouteChange);
			};
		}
	}, [isOpen, onToggle]);

	// Prevent scrolling when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [isOpen]);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		onToggle();
		router.refresh();
	};

	const toggleUserMenu = () => {
		setUserMenuOpen(!userMenuOpen);
	};

	return (
		<div className="md:hidden">
			{/* Hamburger Button */}
			<button onClick={onToggle} className="relative rounded-lg border border-white/50 bg-white/90 p-2" aria-label="Toggle menu">
				{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>

			{/* Overlay */}
			{isOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onToggle} />}

			{/* Side Menu */}
			<div
				className={`fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-gradient-to-b from-pink-200 via-purple-200 to-cyan-200 z-50 transform transition-transform duration-300 ease-in-out ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Header with close button */}
					<div className="flex items-center justify-between p-4 border-b border-white/50">
						<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-xl font-black uppercase tracking-wider text-transparent">
							ShowSpace
						</span>
						<button onClick={onToggle} className="rounded-full p-1 bg-white/50 hover:bg-white/80 transition">
							<X className="h-6 w-6" />
						</button>
					</div>

					{/* Menu Links */}
					<div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
						{links.map((link) => (
							<div key={link.href} onClick={() => link.href !== '#' && onToggle()}>
								<NavLink {...link} />
							</div>
						))}

						{/* User Section */}
						{user ? (
							<div className="mt-6 pt-6 border-t border-white/50">
								<button
									onClick={toggleUserMenu}
									className="flex w-full items-center justify-between rounded-lg border border-white/50 bg-white/90 px-4 py-3 font-bold tracking-wide"
								>
									<div className="flex items-center gap-2">
										<UserIcon className="h-5 w-5" />
										<span>{user.user_metadata.username?.toUpperCase() || 'ACCOUNT'}</span>
									</div>
									{userMenuOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
								</button>

								{/* User Menu Items */}
								<div
									className={`mt-2 space-y-2 pl-4 transition-all duration-200 ${
										userMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
									}`}
								>
									<Link
										href="/profile"
										className="flex items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition"
									>
										<UserIcon className="h-5 w-5" />
										Profile
									</Link>
									<Link
										href="/lists"
										className="flex items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition"
									>
										<List className="h-5 w-5" />
										My Lists
									</Link>
									<Link
										href="/settings"
										className="flex items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition"
									>
										<Settings className="h-5 w-5" />
										Settings
									</Link>
									<button
										onClick={handleSignOut}
										className="flex w-full items-center gap-2 rounded-lg bg-red-100 px-4 py-3 font-bold tracking-wide text-red-600 hover:bg-red-200 transition"
									>
										<LogOut className="h-5 w-5" />
										Sign Out
									</button>
								</div>
							</div>
						) : (
							<div className="mt-6 pt-6 border-t border-white/50 space-y-4">
								<Link
									href="/login"
									className="flex items-center justify-center w-full rounded-lg bg-white/90 px-4 py-3 font-bold tracking-wide hover:bg-white/80 transition"
								>
									LOG IN
								</Link>
								<Link
									href="/signup"
									className="flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-4 py-3 font-bold tracking-wide text-white hover:opacity-90 transition"
								>
									SIGN UP
								</Link>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="p-4 text-center text-sm text-gray-600 border-t border-white/50">
						<p>© ShowSpace {new Date().getFullYear()}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
