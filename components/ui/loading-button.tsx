// components/ui/loading-button.tsx - Complete replacement
import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	isLoading: boolean;
	loadingText?: string;
	variant?: 'default' | 'outline' | 'ghost' | 'link' | 'gradient';
	size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
	children,
	isLoading,
	onClick,
	disabled,
	className,
	loadingText,
	variant = 'default',
	size = 'md',
	type = 'button',
	...props
}: LoadingButtonProps) {
	// Define size classes
	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg',
	};

	// Define variant classes
	const variantClasses = {
		default: 'bg-purple-500 text-white hover:bg-purple-600',
		outline: 'border border-purple-500 text-purple-500 hover:bg-purple-50',
		ghost: 'text-purple-500 hover:bg-purple-50',
		link: 'text-purple-500 hover:underline',
		gradient: 'group relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 text-white',
	};

	// For the gradient variant, we need an inner span for the background and hover effect
	const isGradient = variant === 'gradient';

	if (isGradient) {
		return (
			<button
				onClick={onClick}
				disabled={isLoading || disabled}
				type={type}
				className={cn(
					'group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 text-white focus:outline-none transition disabled:opacity-70 w-full',
					className
				)}
				{...props}
			>
				<span className="relative flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
					{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
					{isLoading && loadingText ? loadingText : children}
				</span>
			</button>
		);
	}

	return (
		<button
			onClick={onClick}
			disabled={isLoading || disabled}
			type={type}
			className={cn(
				'flex items-center justify-center gap-2 rounded-lg font-bold tracking-wide transition focus:outline-none disabled:opacity-70',
				sizeClasses[size],
				variantClasses[variant],
				isLoading && 'cursor-not-allowed',
				className
			)}
			{...props}
		>
			{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
			{isLoading && loadingText ? loadingText : children}
		</button>
	);
}
