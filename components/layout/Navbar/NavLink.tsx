// components/layout/Navbar/NavLink.tsx
import React from 'react';
import Link from 'next/link';
import { NavLinkProps } from '@/types/navbar';
import { usePathname } from 'next/navigation';

export function NavLink({ href, label, active: propActive }: NavLinkProps) {
	const pathname = usePathname();
	const isActive = propActive !== undefined ? propActive : pathname === href;

	return (
		<Link href={href} className="group relative">
			<div
				className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 blur transition 
        ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}
			/>
			<div className="relative rounded-lg border border-white/50 bg-white/90 px-4 py-2 font-bold tracking-wide text-gray-900">
				{label}
			</div>
		</Link>
	);
}
