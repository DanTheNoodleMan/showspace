// components/shared/GridBackground.tsx
import React from 'react';

export const GridBackground = () => (
	<svg className="absolute inset-0 h-full w-full opacity-20 z-0" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
				<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
			</pattern>
			<linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#ff77ff" />
				<stop offset="50%" stopColor="#77ffff" />
				<stop offset="100%" stopColor="#ff77ff" />
			</linearGradient>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid)" stroke="url(#grid-gradient)" />
	</svg>
);
