import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	eslint: {
		// This disables ESLint during production builds
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
