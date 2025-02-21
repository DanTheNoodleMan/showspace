// src/components/auth/AuthForm.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
	type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
	const router = useRouter();
	const supabase = createClient();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (type === 'signup') {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							username,
						},
					},
				});
				if (error) {
					console.log(error);
					throw error;
				}

				router.push('/login?message=Check your email to confirm your account');
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
				router.push('/');
				router.refresh();
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="rounded-xl border-4 border-white/50 bg-white/90 p-8 shadow-xl backdrop-blur-lg">
			<h2 className="mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-center text-3xl font-black uppercase tracking-wider text-transparent">
				{type === 'login' ? 'Welcome Back' : 'Join ShowSpace'}
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				{type === 'signup' && (
					<div>
						<label htmlFor="username" className="mb-1 block font-bold tracking-wide text-gray-700">
							USERNAME
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-2 focus:border-purple-400 focus:outline-none"
							required
						/>
					</div>
				)}

				<div>
					<label htmlFor="email" className="mb-1 block font-bold tracking-wide text-gray-700">
						EMAIL
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-2 focus:border-purple-400 focus:outline-none"
						required
					/>
				</div>

				<div>
					<label htmlFor="password" className="mb-1 block font-bold tracking-wide text-gray-700">
						PASSWORD
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full rounded-lg border-2 border-purple-200 bg-white/50 p-2 focus:border-purple-400 focus:outline-none"
						required
					/>
				</div>

				{error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">{error}</div>}

				<button
					type="submit"
					disabled={loading}
					className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none cursor-pointer"
				>
					<span className="relative block rounded-md bg-white px-8 py-3 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
						{loading ? 'Loading...' : type === 'login' ? 'Log In' : 'Sign Up'}
					</span>
				</button>

				<p className="text-center text-sm text-gray-600">
					{type === 'login' ? (
						<>
							Don't have an account?{' '}
							<Link href="/signup" className="font-bold text-purple-600 hover:text-purple-800">
								Sign up
							</Link>
						</>
					) : (
						<>
							Already have an account?{' '}
							<Link href="/login" className="font-bold text-purple-600 hover:text-purple-800">
								Log in
							</Link>
						</>
					)}
				</p>
			</form>
		</div>
	);
}
