// src/components/layout/Navbar/UserButton.tsx
'use client';
import { UserButtonProps } from '@/types/navbar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Settings, List } from 'lucide-react';

export function UserButton({ user }: UserButtonProps) {
	const router = useRouter();
	const supabase = createClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<Link href="/login" className="group relative">
					<div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
					<div className="relative rounded-lg border border-white/50 bg-white/90 px-4 py-2 font-bold tracking-wide">LOG IN</div>
				</Link>
				<Link href="/signup" className="group relative">
					<div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
					<div className="relative rounded-lg border border-white/50 bg-white/90 px-4 py-2 font-bold tracking-wide">SIGN UP</div>
				</Link>
			</div>
		);
	}

	return (
		<div className="relative group">
			<button className="group relative">
				<div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
				<div className="relative flex items-center gap-2 rounded-lg border border-white/50 bg-white/90 px-4 py-2 font-bold tracking-wide">
					<UserIcon className="h-5 w-5" />
					{user.email?.split('@')[0].toUpperCase() ?? 'ACCOUNT'}
				</div>
			</button>

			{/* Dropdown Menu */}
			<div className="absolute right-0 mt-2 w-48 scale-0 rounded-xl border-4 border-white/50 bg-white/90 p-2 shadow-lg backdrop-blur-lg transition-all group-hover:scale-100">
				<div className="space-y-1">
					<Link
						href="/profile"
						className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-bold tracking-wide text-gray-700 transition hover:bg-purple-100"
						onClick={() => console.log('Profile')}
					>
						<UserIcon className="h-5 w-5" />
						Profile
					</Link>
					<Link
						href="/lists"
						className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-bold tracking-wide text-gray-700 transition hover:bg-purple-100"
					>
						<List className="h-5 w-5" />
						My Lists
					</Link>
					<Link
						href="/settings"
						className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-bold tracking-wide text-gray-700 transition hover:bg-purple-100"
					>
						<Settings className="h-5 w-5" />
						Settings
					</Link>
					<hr className="my-2 border-purple-100" />
					<button
						onClick={handleSignOut}
						className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-bold tracking-wide text-red-600 transition hover:bg-red-50"
					>
						<LogOut className="h-5 w-5" />
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
}
