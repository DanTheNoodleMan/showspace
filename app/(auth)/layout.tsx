// src/app/(auth)/layout.tsx
import { GridBackground } from '@/components/shared/GridBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-cyan-100">
			<div className="absolute inset-0">
				<GridBackground />
			</div>
			<div className="relative flex min-h-screen items-center justify-center p-4">{children}</div>
		</div>
	);
}
