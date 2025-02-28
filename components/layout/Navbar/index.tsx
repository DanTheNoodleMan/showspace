// src/components/layout/Navbar/index.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { NavLink } from './NavLink';
import { MobileMenu } from './MobileMenu';
import { UserButton } from './UserButton';
import { usePathname } from 'next/navigation';
import { NavLink as NavLinkType } from '@/types/navbar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserSearch } from '@/components/shared/UserSearch';

const NAV_LINKS = {
	public: [
		{ href: '/', label: 'HOME' },
		{ href: '/daily-trailer', label: 'DAILY GAME' },
	],
	authenticated: [
		{ href: '/', label: 'HOME' },
		{ href: '/daily-trailer', label: 'DAILY GAME' },
		{ href: '/lists', label: 'MY LISTS' },
	],
} as const;

export function Navbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const { user, isLoading } = useAuth();

	// Create a mutable copy of the links array based on auth state
	const links: NavLinkType[] = [...(user ? NAV_LINKS.authenticated : NAV_LINKS.public)];

	if (isLoading) {
		return <NavbarSkeleton />;
	}

	return (
		<header className="sticky top-0 z-50">
			<div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 opacity-80" />
			<nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<div className="flex items-center gap-2">
					<Link href={'/'}>
						<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-lg md:text-3xl font-black uppercase tracking-wider text-transparent">
							SHOWSPACE
						</span>
					</Link>
				</div>

				{/* User Search Bar */}
				<div className="hidden flex-1 px-8 md:block">
					<UserSearch />
				</div>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-4 md:flex">
					{links.map((link) => (
						<NavLink key={link.href} {...link} active={pathname === link.href} />
					))}
					<UserButton user={user} />
				</div>

				{/* Mobile Navigation */}
				<MobileMenu isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} links={links} user={user} />
			</nav>
		</header>
	);
}

// Add a simple loading skeleton
function NavbarSkeleton() {
	return (
		<header className="sticky top-0 z-50">
			<div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 opacity-80" />
			<nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<div className="h-8 w-32 animate-pulse rounded-lg bg-white/50" />
				<div className="hidden md:flex items-center gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-white/50" />
					))}
				</div>
				<div className="md:hidden h-10 w-10 animate-pulse rounded-lg bg-white/50" />
			</nav>
		</header>
	);
}
