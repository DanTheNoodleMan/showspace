// components/layout/Navbar/MobileMenu.tsx

import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, Settings, List, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { NavLink } from './NavLink';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { MobileMenuProps } from '@/types/navbar';

const PATHS_WITH_LOADING_OVERLAY = ['/profile', '/lists', '/settings', '/login', '/signup'];

// Safety timeout to prevent infinite loading state (in milliseconds)
const LOADING_TIMEOUT = 3000;

export function MobileMenu({ isOpen, onToggle, links, user }: MobileMenuProps) {
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const [navigatingPath, setNavigatingPath] = useState<string | null>(null);
	const router = useRouter();
	const pathname = usePathname();
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

	// Track path changes to reset navigation state
	useEffect(() => {
		setIsNavigating(false);
		setNavigatingPath(null);
	}, [pathname]);

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

	// Check if a path should show loading overlay
	const shouldShowLoadingFor = (path: string): boolean => {
		return PATHS_WITH_LOADING_OVERLAY.some(
			(loadingPath) =>
				// Exact match or starts with the loading path (for nested routes)
				path === loadingPath || path.startsWith(`${loadingPath}/`)
		);
	};

	const handleSignOut = async () => {
		onToggle();
		await supabase.auth.signOut();
		router.refresh();
	};

	const toggleUserMenu = () => {
		setUserMenuOpen(!userMenuOpen);
	};

	// Wrapper for navigation links to handle closing and loading state
	const handleNavigation = (href: string) => {
		// Skip if already on the same page
		if (pathname === href) {
			onToggle(); // Just close the menu
			return;
		}

		// Always close the menu
		onToggle();

		// Only show loading state for specified paths
		if (shouldShowLoadingFor(href)) {
			setIsNavigating(true);
			setNavigatingPath(href);

			// Safety timeout to prevent infinite loading state
			// This will clear the loading state after a set time
			// in case navigation doesn't trigger a path change
			setTimeout(() => {
				setIsNavigating(false);
				setNavigatingPath(null);
			}, LOADING_TIMEOUT);
		}

		// Navigate
		router.push(href);
	};

	// Get the name of the current page being loaded (for display in the loading overlay)
	const getLoadingPageName = (): string => {
		if (!navigatingPath) return 'Page';

		// Extract page name from path
		const pathParts = navigatingPath.split('/').filter(Boolean);
		if (pathParts.length === 0) return 'Home';

		// Convert to title case and replace hyphens with spaces
		const pageName = pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

		return pageName;
	};

	return (
		<div className="md:hidden">
			{/* Hamburger Button */}
			<button onClick={onToggle} className="relative rounded-lg border border-white/50 bg-white/90 p-2" aria-label="Toggle menu">
				{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>

			{/* Navigation Overlay - Shows when navigating to specific pages */}
			{isNavigating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100 bg-opacity-80 backdrop-blur-sm">
					<div className="rounded-xl border-4 border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-lg">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-10 w-10 animate-spin text-purple-500" />
							<p className="font-bold text-gray-800">Loading {getLoadingPageName()}...</p>
						</div>
					</div>
				</div>
			)}

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
							<div key={link.href} onClick={() => link.href !== '#' && handleNavigation(link.href)}>
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
									<button
										onClick={() => handleNavigation('/profile')}
										className="flex w-full items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition text-left"
									>
										<UserIcon className="h-5 w-5" />
										Profile
									</button>
									<button
										onClick={() => handleNavigation('/lists')}
										className="flex w-full items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition text-left"
									>
										<List className="h-5 w-5" />
										My Lists
									</button>
									<button
										onClick={() => handleNavigation('/settings')}
										className="flex w-full items-center gap-2 rounded-lg bg-white/50 px-4 py-3 font-bold tracking-wide text-gray-700 hover:bg-white/80 transition text-left"
									>
										<Settings className="h-5 w-5" />
										Settings
									</button>
									<button
										onClick={handleSignOut}
										className="flex w-full items-center gap-2 rounded-lg bg-red-100 px-4 py-3 font-bold tracking-wide text-red-600 hover:bg-red-200 transition text-left"
									>
										<LogOut className="h-5 w-5" />
										Sign Out
									</button>
								</div>
							</div>
						) : (
							<div className="mt-6 pt-6 border-t border-white/50 space-y-4">
								<button
									onClick={() => handleNavigation('/login')}
									className="flex items-center justify-center w-full rounded-lg bg-white/90 px-4 py-3 font-bold tracking-wide hover:bg-white/80 transition"
								>
									LOG IN
								</button>
								<button
									onClick={() => handleNavigation('/signup')}
									className="flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-4 py-3 font-bold tracking-wide text-white hover:opacity-90 transition"
								>
									SIGN UP
								</button>
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
