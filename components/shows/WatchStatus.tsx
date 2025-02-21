// components/shows/WatchStatus.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, Clock, Check, X } from 'lucide-react';
import { Database } from '@/lib/supabase/database.types';

type WatchStatus = Database['public']['Tables']['watch_status']['Row']['status'];

interface WatchStatusProps {
	showId: number;
	initialStatus?: WatchStatus;
	onStatusChange?: (newStatus: WatchStatus) => void;
}

const WATCH_STATUSES = [
	{ value: 'watching', label: 'Watching', icon: Eye },
	{ value: 'completed', label: 'Completed', icon: Check },
	{ value: 'plan_to_watch', label: 'Plan to Watch', icon: Clock },
	{ value: 'dropped', label: 'Dropped', icon: X },
] as const;

export function WatchStatus({ showId, initialStatus, onStatusChange }: WatchStatusProps) {
	const [status, setStatus] = useState<WatchStatus | undefined>(initialStatus);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = createClient();

	const updateWatchStatus = async (newStatus: WatchStatus) => {
		setIsLoading(true);
		setError(null);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error('Not authenticated');
			}

			// Check if a watch status already exists
			const { data: existing } = await supabase
				.from('watch_status')
				.select()
				.eq('user_id', user.id)
				.eq('tmdb_id', showId)
				.eq('content_type', 'show')
				.single();

			if (existing) {
				// Update existing status
				const { error } = await supabase
					.from('watch_status')
					.update({
						status: newStatus,
						updated_at: new Date().toISOString(),
					})
					.eq('id', existing.id);

				if (error) throw error;
			} else {
				// Create new status
				const { error } = await supabase.from('watch_status').insert({
					user_id: user.id,
					tmdb_id: showId,
					content_type: 'show',
					status: newStatus,
				});

				if (error) throw error;
			}

			setStatus(newStatus);
			onStatusChange?.(newStatus);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update status');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-2">
				{WATCH_STATUSES.map(({ value, label, icon: Icon }) => (
					<button
						key={value}
						onClick={() => updateWatchStatus(value)}
						disabled={isLoading}
						className={`flex items-center justify-center gap-2 rounded-lg border-2 
              ${
					status === value
						? 'border-purple-500 bg-purple-100 text-purple-700'
						: 'border-purple-200 bg-white/50 text-gray-700 hover:bg-purple-50'
				} p-3 font-bold transitionn cursor-pointer`}
					>
						<Icon className="h-5 w-5" />
						{label}
					</button>
				))}
			</div>
			{error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">{error}</div>}
		</div>
	);
}
