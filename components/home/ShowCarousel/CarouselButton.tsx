// components/home/ShowCarousel/CarouselButton.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselButtonProps {
	direction: 'left' | 'right';
	onClick: () => void;
}

export const CarouselButton = ({ direction, onClick }: CarouselButtonProps) => (
	<button
		onClick={onClick}
		className={`absolute top-1/2 -translate-y-1/2 rounded-full cursor-pointer border-2 border-white/50 bg-white/90 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-xl ${
			direction === 'left' ? '-left-5' : '-right-5'
		}`}
	>
		{direction === 'left' ? <ChevronLeft className="h-6 w-6 text-purple-500" /> : <ChevronRight className="h-6 w-6 text-purple-500" />}
	</button>
);
