// app/page.tsx
import React from 'react';
import { GridBackground } from '@/components/shared/GridBackground';
import { HeroSection } from '@/components/home/HeroSection';
import { ShowCarousel } from '@/components/home/ShowCarousel';
import { FeatureCard } from '@/components/home/FeatureCard';
import { BookMarked, List, User } from 'lucide-react';

const FEATURES = [
	{
		icon: <BookMarked className="h-8 w-8" />,
		title: 'TRACK SHOWS',
		description: 'Keep your watching history organized',
	},
	{
		icon: <List className="h-8 w-8" />,
		title: 'MAKE LISTS',
		description: 'Create your ultimate show collections',
	},
	{
		icon: <User className="h-8 w-8" />,
		title: 'JOIN FRIENDS',
		description: 'Connect with other TV enthusiasts',
	},
];

export default function HomePage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100">
			{/* Grid Background Layer */}
			<div className="absolute inset-0">
				<GridBackground />
			</div>

			{/* Content Layer */}
			<div className="relative z-10 flex flex-col gap-16 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
				<HeroSection />

				{/* Trending Shows */}
				<section className="px-4 py-12 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="mb-8 inline-block rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 px-6 py-2 text-2xl font-black tracking-wider text-gray-800 shadow-xl backdrop-blur-lg">
							TRENDING NOW
						</div>
						<ShowCarousel />
					</div>
				</section>

				{/* Features Grid */}
				<section className="relative px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{FEATURES.map((feature, index) => (
								<FeatureCard key={index} {...feature} />
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
