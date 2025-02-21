// components/home/FeatureCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
	<div className="group relative">
		<div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition group-hover:opacity-100" />
		<div className="relative rounded-xl border-4 border-white/50 bg-white/90 p-6 backdrop-blur-lg">
			<div className="mb-4 inline-block rounded-lg bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-3">{icon}</div>
			<h3 className="mb-2 text-xl font-black tracking-wider text-gray-800">{title}</h3>
			<p className="text-gray-600">{description}</p>
		</div>
	</div>
);
