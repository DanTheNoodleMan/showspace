// components/layout/Navbar/MobileMenu.tsx

import React from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from './NavLink';
import { UserButton } from './UserButton';
import { MobileMenuProps } from '@/types/navbar';

export function MobileMenu({ isOpen, onToggle, links, user }: MobileMenuProps) {
	return (
		<div className="md:hidden">
			<button onClick={onToggle} className="relative rounded-lg border border-white/50 bg-white/90 p-2">
				{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>

			{isOpen && (
				<div className="absolute left-0 right-0 top-full mt-2 rounded-lg border-4 border-white/50 bg-white/90 p-4 backdrop-blur-lg">
					<div className="flex flex-col gap-2">
						{links.map((link) => (
							<NavLink key={link.href} {...link} />
						))}
						<div className="mt-2">
							<UserButton user={user} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
