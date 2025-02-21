// app/shows/[id]/page.tsx
import { Suspense } from 'react';
import { ShowDetails } from '@/app/shows/[id]/ShowDetails';
import { ShowSkeleton } from '@/app/shows/[id]/ShowSkeleton';
import { GridBackground } from '@/components/shared/GridBackground';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function ShowPage({ params }: PageProps) {
	const resolvedParams = await params;

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pb-16 pt-8">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<Suspense fallback={<ShowSkeleton />}>
				<ShowDetails showId={resolvedParams.id} />
			</Suspense>
		</div>
	);
}
