// app/profile/error.tsx
'use client';

import { useEffect } from 'react';
import { GridBackground } from '@/components/shared/GridBackground';
import Link from 'next/link';

export default function ProfileError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8 shadow-xl backdrop-blur-lg">
					<div className="flex flex-col items-center text-center">
						<h2 className="mb-4 text-2xl font-black uppercase tracking-wider text-gray-800">OOPS! SOMETHING WENT WRONG</h2>
						<p className="mb-6 max-w-lg font-mono text-gray-700">
							We couldn&apos;t load your profile data. This might be due to network issues or server problems.
						</p>
						<div className="flex gap-4">
							<button
								onClick={reset}
								className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none"
							>
								<span className="relative block rounded-md bg-white px-8 py-3 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
									TRY AGAIN
								</span>
							</button>
							<Link
								href="/"
								className="rounded-lg border-2 border-purple-300 bg-white/50 px-8 py-3 font-bold tracking-wide text-purple-600 transition hover:bg-purple-100"
							>
								GO HOME
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
