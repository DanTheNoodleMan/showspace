import { User } from '@supabase/supabase-js';

export interface NavLink {
	href: string;
	label: string;
}

export interface NavLinkProps extends NavLink {
	active?: boolean;
}

export interface MobileMenuProps {
	isOpen: boolean;
	onToggle: () => void;
	links: NavLink[];
	user: User | null;
}

export interface UserButtonProps {
	user: User | null;
}
