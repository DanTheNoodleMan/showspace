// src/app/daily-trailer/page.tsx
import React from 'react';
import { DailyTrailerGame } from '@/components/daily-trailer/DailyTrailerGame';
import { Suspense } from 'react';
import { GridBackground } from '@/components/shared/GridBackground';
import { getDailyMovie } from '@/services/daily-trailer';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ShowSpace - Daily Trailer Game',
	description: 'Guess the rating of the daily movie trailer and compete for the highest streak!',
};

export default async function DailyTrailerPage() {
	const dailyMovie = await getDailyMovie();

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100 pt-8 pb-16">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 inline-block rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 px-6 py-2 text-2xl font-black tracking-wider text-gray-800 shadow-xl backdrop-blur-lg">
					DAILY TRAILER CHALLENGE
				</div>
				<Suspense fallback={<div>Loading today's challenge...</div>}>
					<DailyTrailerGame movie={dailyMovie} />
				</Suspense>
			</div>
		</div>
	);
}
