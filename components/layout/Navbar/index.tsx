// src/components/layout/Navbar/index.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { NavLink } from './NavLink';
import { MobileMenu } from './MobileMenu';
import { UserButton } from './UserButton';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { NavLink as NavLinkType } from '@/types/navbar';

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
	const [user, setUser] = useState<User | null>(null);
	const pathname = usePathname();
	const supabase = createClient();

	useEffect(() => {
		// Get and validate user
		supabase.auth.getUser().then(({ data }) => {
			setUser(data?.user ?? null);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	// Create a mutable copy of the links array based on auth state
	const links: NavLinkType[] = [...(user ? NAV_LINKS.authenticated : NAV_LINKS.public)];

	return (
		<header className="sticky top-0 z-50">
			<div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 opacity-80" />
			<nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<div className="flex items-center gap-2">
					<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-lg md:text-3xl font-black uppercase tracking-wider text-transparent">
						SHOWSPACE
					</span>
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
