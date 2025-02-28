'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface WatchStatusProps {
	showId: number;
	initialStatus?: string;
	onStatusChange?: (newStatus: string) => void;
}

export function WatchStatus({ showId, initialStatus, onStatusChange }: WatchStatusProps) {
	const [status, setStatus] = useState(initialStatus || '');
	const [isLoading, setIsLoading] = useState(false);
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const supabase = createClient();

	const handleStatusChange = async (newStatus: string) => {
		// Check authentication first
		if (!user) {
			// Redirect to login if not authenticated
			router.push(`/login?redirectTo=/shows/${showId}`);
			return;
		}

		setIsLoading(true);
		try {
			if (newStatus === status) {
				// If clicking the active status again, remove it
				await supabase.from('watch_status').delete().eq('user_id', user.id).eq('tmdb_id', showId).eq('content_type', 'show');
				setStatus('');
				if (onStatusChange) onStatusChange('');
			} else {
				// Otherwise, update or insert new status
				const { error } = await supabase.from('watch_status').upsert({
					user_id: user.id,
					tmdb_id: showId,
					content_type: 'show',
					status: newStatus,
					updated_at: new Date().toISOString(),
				});

				if (error) throw error;

				setStatus(newStatus);
				if (onStatusChange) onStatusChange(newStatus);
			}
		} catch (error) {
			console.error('Error updating watch status:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// While checking auth status
	if (authLoading) {
		return (
			<div className="flex items-center justify-center py-2">
				<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
			</div>
		);
	}
	// If not authenticated, show login prompt
	if (!user) {
		return (
			<div className="rounded-xl border-2 border-purple-300 bg-white/70 p-4">
				<p className="text-center text-gray-700 mb-2">Login to track your watch status</p>
				<button
					onClick={() => router.push(`/login?redirectTo=/shows/${showId}`)}
					className="w-full rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-4 py-2 font-bold text-white hover:opacity-90 transition cursor-pointer"
				>
					Sign in
				</button>
			</div>
		);
	}

	// Authentication status buttons
	return (
		<div className="flex flex-wrap gap-2">
			{isLoading ? (
				<div className="flex w-full items-center justify-center py-2">
					<Loader2 className="h-5 w-5 animate-spin text-purple-500" />
					<span className="ml-2">Updating...</span>
				</div>
			) : (
				<>
					{['Watching', 'Completed', 'Plan to Watch', 'Dropped'].map((statusOption) => (
						<button
							key={statusOption}
							onClick={() => handleStatusChange(statusOption)}
							className={`rounded-lg px-4 py-2 font-bold transition ${
								status === statusOption
									? 'bg-purple-500 text-white'
									: 'border-2 border-purple-300 bg-white/50 text-purple-600 hover:bg-purple-100'
							}`}
						>
							{statusOption}
						</button>
					))}
				</>
			)}
		</div>
	);
}
