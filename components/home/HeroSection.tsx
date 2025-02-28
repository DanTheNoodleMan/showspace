// components/home/HeroSection.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { StarBurst } from '@/components/layout/Navbar/StarBurst';
import { SearchBar } from '@/components/shared/SearchBar';
import { ShowSearch } from '@/components/shared/ShowSearch';

export const HeroSection = () => (
	<section className="mx-auto max-w-4xl text-center">
		<div className="mb-8 inline-block rounded-full border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 px-8 py-3 shadow-xl backdrop-blur-lg">
			<span className="font-bold tracking-widest text-gray-800">TRACK • RATE • DISCOVER</span>
		</div>

		<h1
			className="mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-6xl font-black uppercase tracking-wider text-transparent"
			style={{ textShadow: '4px 4px 8px rgba(255,255,255,0.5)' }}
		>
			Your Digital TV Diary
		</h1>

		<ShowSearch />
	</section>
);
