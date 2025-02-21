// components/shared/SearchBar.tsx
import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = () => (
	<div className="relative mx-auto max-w-2xl">
		<div className="relative overflow-hidden rounded-full border-4 border-white/50 bg-white/90 shadow-xl backdrop-blur-lg">
			<Search className="absolute left-4 top-3 h-6 w-6 text-purple-400" />
			<input
				type="text"
				placeholder="SEARCH SHOWS..."
				className="w-full bg-transparent px-6 py-3 pl-12 font-bold tracking-wide text-gray-700 placeholder-purple-300 focus:outline-none"
			/>
		</div>
	</div>
);
