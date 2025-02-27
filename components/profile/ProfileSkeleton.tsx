// components/profile/ProfileSkeleton.tsx
import React from 'react';

export function ProfileSkeleton() {
	return (
		<>
			{/* Profile Header Skeleton */}
			<div className="relative overflow-hidden rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8 shadow-xl backdrop-blur-lg">
				<div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
					{/* Avatar Circle Skeleton */}
					<div className="h-32 w-32 rounded-full bg-white/50 animate-pulse"></div>

					{/* User Info Skeleton */}
					<div className="flex flex-col">
						<div className="h-10 w-64 bg-white/50 animate-pulse rounded-md mb-2"></div>
						<div className="h-5 w-32 bg-white/50 animate-pulse rounded-md mb-4"></div>

						{/* Quick Stats Skeleton */}
						<div className="flex flex-wrap justify-center gap-6 md:justify-start">
							<div className="h-7 w-24 bg-white/50 animate-pulse rounded-md"></div>
							<div className="h-7 w-24 bg-white/50 animate-pulse rounded-md"></div>
							<div className="h-7 w-24 bg-white/50 animate-pulse rounded-md"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats and Activity Feed Skeleton */}
			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				{/* Stats Grid Skeleton */}
				<div className="lg:col-span-1">
					<div className="grid grid-cols-2 gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-24 rounded-lg border-2 border-white/50 bg-white/50 animate-pulse"></div>
						))}
					</div>
				</div>

				{/* Activity Feed Skeleton */}
				<div className="lg:col-span-2">
					<div className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6 shadow-xl backdrop-blur-lg">
						<div className="h-8 w-48 bg-white/50 animate-pulse rounded-md mb-6"></div>
						<div className="space-y-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="rounded-lg bg-white/50 p-4">
									<div className="h-6 w-3/4 bg-white/70 animate-pulse rounded-md mb-2"></div>
									<div className="h-4 w-1/2 bg-white/70 animate-pulse rounded-md"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
