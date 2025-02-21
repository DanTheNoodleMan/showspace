'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Show } from '@/types';
import { ShowCard } from './ShowCard';
import { CarouselButton } from './CarouselButton';

export const ShowCarousel = () => {
	const [shows, setShows] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchShows = async () => {
			try {
				const response = await fetch('/api/shows/trending');
				const data = await response.json();
				if (!response.ok) throw new Error(data.error);
				setShows(data.shows);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch shows');
			} finally {
				setLoading(false);
			}
		};
		fetchShows();
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const checkScroll = () => {
			const { scrollLeft, scrollWidth, clientWidth } = container;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // -10 for buffer
		};

		// Check initial scroll state
		checkScroll();

		// Add scroll event listener
		container.addEventListener('scroll', checkScroll);

		// Add resize listener to recheck on window resize
		window.addEventListener('resize', checkScroll);

		return () => {
			container.removeEventListener('scroll', checkScroll);
			window.removeEventListener('resize', checkScroll);
		};
	}, [shows]); // Re-run when shows change

	const handleScroll = (direction: 'left' | 'right') => {
		if (!scrollContainerRef.current) return;

		const container = scrollContainerRef.current;
		const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width

		container.scrollTo({
			left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
			behavior: 'smooth',
		});
	};

	if (loading)
		return (
			<div className="flex h-64 items-center justify-center rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6">
				<div className="text-xl font-bold text-purple-600">Loading shows...</div>
			</div>
		);

	if (error)
		return (
			<div className="flex h-64 items-center justify-center rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6">
				<div className="text-xl font-bold text-red-500">Error: {error}</div>
			</div>
		);

	return (
		<div className="relative rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 shadow-xl backdrop-blur-lg">
			<div
				ref={scrollContainerRef}
				className="relative flex gap-6 overflow-x-auto p-6 scrollbar-hide"
				style={{
					scrollSnapType: 'x mandatory',
					WebkitOverflowScrolling: 'touch',
				}}
			>
				{shows.map((show) => (
					<div key={show.id} className="w-56 flex-none scroll-snap-align-center" style={{ scrollSnapAlign: 'center' }}>
						<ShowCard show={show} />
					</div>
				))}
			</div>

			{/* Navigation Buttons */}
			{canScrollLeft && <CarouselButton direction="left" onClick={() => handleScroll('left')} />}
			{canScrollRight && <CarouselButton direction="right" onClick={() => handleScroll('right')} />}
		</div>
	);
};
