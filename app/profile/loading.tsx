// app/profile/loading.tsx
import { GridBackground } from '@/components/shared/GridBackground';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export default function ProfileLoading() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ProfileSkeleton />
			</div>
		</div>
	);
}
