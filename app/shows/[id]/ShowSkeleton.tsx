// app/shows/[id]/ShowSkeleton.tsx
export function ShowSkeleton() {
	return (
		<div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
			<div className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8">
				<div className="flex flex-col gap-8 md:flex-row">
					<div className="h-96 w-64 rounded-lg bg-white/50" />
					<div className="flex flex-col gap-4">
						<div className="h-12 w-3/4 rounded-lg bg-white/50" />
						<div className="h-6 w-24 rounded-lg bg-white/50" />
						<div className="h-24 w-full rounded-lg bg-white/50" />
						<div className="flex gap-2">
							<div className="h-8 w-24 rounded-full bg-white/50" />
							<div className="h-8 w-32 rounded-full bg-white/50" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
