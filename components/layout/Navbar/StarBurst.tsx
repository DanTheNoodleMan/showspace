import React from 'react';

interface StarBurstProps {
	className?: string;
}

export function StarBurst({ className }: StarBurstProps) {
	return (
		<svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#ff77ff" />
					<stop offset="50%" stopColor="#77ffff" />
					<stop offset="100%" stopColor="#ff77ff" />
				</linearGradient>
			</defs>
			{[...Array(12)].map((_, i) => (
				<line
					key={i}
					x1="50"
					y1="50"
					x2="50"
					y2="0"
					stroke="url(#star-gradient)"
					strokeWidth="2"
					transform={`rotate(${i * 30} 50 50)`}
				/>
			))}
		</svg>
	);
}
