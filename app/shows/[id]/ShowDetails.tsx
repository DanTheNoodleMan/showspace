// app/shows/[id]/ShowDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import {
	Star,
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Clock,
	Calendar,
	TrendingUp,
	Award,
	Tv2,
	Users,
	Globe,
	Play,
	ExternalLink,
} from 'lucide-react';
import { getTMDBImageUrl } from '@/config/tmdb';
import { formatDistanceToNow } from 'date-fns';
import { ShowSkeleton } from './ShowSkeleton';
import { WatchStatus } from '@/components/shows/WatchStatus';
import Link from 'next/link';

interface ShowDetailsProps {
	showId: string;
}

// Add this helper function
function calculateBingeTime(episodes: any[]) {
	const totalMinutes = episodes.reduce((acc, ep) => acc + (ep.runtime || 0), 0);
	const days = Math.floor(totalMinutes / (24 * 60));
	const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
	const minutes = totalMinutes % 60;

	let result = [];
	if (days > 0) result.push(`${days}d`);
	if (hours > 0) result.push(`${hours}h`);
	if (minutes > 0) result.push(`${minutes}m`);

	return result.join(' ');
}

export function ShowDetails({ showId }: ShowDetailsProps) {
	const [show, setShow] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});
	const [showSpoilers, setShowSpoilers] = useState(false);

	useEffect(() => {
		async function fetchShow() {
			try {
				const response = await fetch(`/api/shows/${showId}`);
				const data = await response.json();
				if (!response.ok) throw new Error(data.error);
				setShow(data.show);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch show');
			} finally {
				setLoading(false);
			}
		}
		fetchShow();
	}, [showId]);

	const toggleSeason = (seasonNumber: number) => {
		setExpandedSeasons((prev) => ({
			...prev,
			[seasonNumber]: !prev[seasonNumber],
		}));
	};

	if (loading) return <ShowSkeleton />;
	if (error) return <div>Error: {error}</div>;
	if (!show) return null;

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{/* Show Header */}
			<div className="relative rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-8 shadow-xl backdrop-blur-lg">
				<div className="flex flex-col gap-8 md:flex-row">
					{/* Left column with poster and quick stats */}
					<div className="flex flex-col gap-4 items-center">
						{/* Poster */}
						<div className="relative h-96 w-auto lg:w-64">
							<div className="absolute -inset-2 max-w-68 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur" />
							<img
								src={getTMDBImageUrl(show.poster_path, 'poster', 'large')!}
								alt={show.name}
								className="relative h-full w-full rounded-lg object-cover"
							/>
						</div>

						{/* Quick Stats Cards */}
						<div className="grid grid-cols-2 gap-2 w-full">
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-3 text-center">
								<TrendingUp className="mx-auto h-5 w-5 text-purple-500" />
								<div className="mt-1 text-sm font-bold text-purple-600">{show.popularity.toFixed(1)}</div>
								<div className="text-xs text-gray-600">Popularity</div>
							</div>
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-3 text-center">
								<Users className="mx-auto h-5 w-5 text-purple-500" />
								<div className="mt-1 text-sm font-bold text-purple-600">{show.vote_count.toLocaleString()}</div>
								<div className="text-xs text-gray-600">Votes</div>
							</div>
						</div>
					</div>

					{/* Show Info */}
					<div className="flex flex-col flex-1">
						{/* Title and Rating */}
						<div className="flex items-center justify-between">
							<h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl md:text-4xl font-black uppercase tracking-wider text-transparent">
								{show.name}
							</h1>
							<div className="flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-white/50 px-2 sm:px-4 py-1 sm:py-2">
								<Star className="h-4 w-4 sm:h-6 sm:w-6 fill-yellow-400 text-yellow-400" />
								<span className="text-base md:text-xl font-bold">{show.vote_average?.toFixed(1)}</span>
							</div>
						</div>

						{/* Tagline */}
						<p className="mb-4 font-mono text-sm italic text-gray-600">"{show.tagline}"</p>

						{/* Overview */}
						<div className="mb-4">
							<button
								onClick={() => setShowSpoilers(!showSpoilers)}
								className="mb-2 flex items-center gap-2 rounded-lg border-2 border-purple-300 bg-white/50 px-4 py-2 font-bold text-purple-600 transition hover:bg-purple-100 cursor-pointer"
							>
								{showSpoilers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								{showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}
							</button>
							<p className="font-mono text-gray-700">
								{showSpoilers ? show.overview : 'Overview hidden to prevent spoilers. Click "Show Spoilers" to reveal.'}
							</p>
						</div>

						{/* Show Stats Grid */}
						<div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 text-center sm:text-left text-sm sm:text-base">
							{/* Status */}
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">Status</h3>
								<div className="flex items-center gap-2 flex-col sm:flex-row">
									<Tv2 className="h-5 w-5 text-purple-500" />
									<span className="font-mono">{show.status}</span>
								</div>
							</div>

							{/* First Aired */}
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">First Aired</h3>
								<div className="flex items-center gap-2 flex-col sm:flex-row">
									<Calendar className="h-5 w-5 text-purple-500" />
									<span className="font-mono">{formatDistanceToNow(new Date(show.first_air_date))} ago</span>
								</div>
							</div>

							{/* Networks */}
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">Network</h3>
								<div className="flex items-center gap-2 flex-col sm:flex-row">
									<Globe className="h-5 w-5 text-purple-500" />
									<Link href={show.homepage} target="_blank" className="group">
										<span className="font-bold flex-row flex items-center gap-2 group-hover:text-purple-500 transition">
											{show.networks[0]?.name} <ExternalLink className="h-4 w-4" />
										</span>
									</Link>
								</div>
							</div>
						</div>

						{/* Genres */}
						<div className="mb-4">
							<h3 className="mb-2 font-bold text-purple-600">Genres</h3>
							<div className="flex flex-wrap gap-2">
								{show.genres.map((genre: any) => (
									<span
										key={genre.id}
										className="rounded-full border-2 border-purple-300 bg-white/50 px-4 py-1 text-sm font-bold text-purple-600"
									>
										{genre.name}
									</span>
								))}
							</div>
						</div>

						{/* Watch Status */}
						<div className="mb-4">
							<h3 className="mb-2 font-bold text-purple-600">Watch Status</h3>
							<WatchStatus
								showId={show.id}
								initialStatus={show.userData?.watchStatus?.status}
								onStatusChange={(newStatus) => {
									// Optionally update local state if needed
									setShow((prev: { userData: { watchStatus: any } }) => ({
										...prev,
										userData: {
											...prev.userData,
											watchStatus: {
												...prev.userData?.watchStatus,
												status: newStatus,
											},
										},
									}));
								}}
							/>
						</div>
						{/* Watch Info */}
						<div className="mt-auto grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Binge Time */}
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">Binge Time</h3>
								<div className="flex items-center gap-2">
									<Clock className="h-5 w-5 text-purple-500" />
									<span className="font-mono">
										{calculateBingeTime(show.seasons.flatMap((s: any) => s.episodes || []))}
									</span>
								</div>
							</div>

							{/* Episode Count */}
							<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">Episodes</h3>
								<div className="flex items-center gap-2">
									<Play className="h-5 w-5 text-purple-500" />
									<span className="font-mono">
										{show.number_of_episodes} episodes in {show.number_of_seasons} seasons
									</span>
								</div>
							</div>
						</div>

						{/* Watch Status if logged in */}
						{show.userWatchStatus && (
							<div className="mt-4 rounded-lg border-2 border-purple-300 bg-white/50 p-4">
								<h3 className="mb-2 font-bold text-purple-600">Your Watch Status</h3>
								<p className="font-mono">{show.userWatchStatus.status}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Created By Section */}
			{show.created_by.length > 0 && (
				<div className="mt-8 rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6 shadow-xl backdrop-blur-lg">
					<h2 className="mb-4 text-xl font-black uppercase tracking-wider">Created By</h2>
					<div className="flex flex-wrap gap-4">
						{show.created_by.map((creator: any) => (
							<div key={creator.id} className="flex items-center gap-3">
								{creator.profile_path && (
									<img
										src={getTMDBImageUrl(creator.profile_path, 'poster', 'small')!}
										alt={creator.name}
										className="h-12 w-12 rounded-full object-cover"
									/>
								)}
								<span className="font-bold">{creator.name}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Seasons List */}
			<div className="mt-8 space-y-4">
				{show.seasons?.map((season: any) => (
					<div
						key={season.id}
						className="rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 shadow-xl backdrop-blur-lg"
					>
						{/* Season Header */}
						<button onClick={() => toggleSeason(season.season_number)} className="flex w-full items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<img
									src={getTMDBImageUrl(season.poster_path, 'poster', 'small')!}
									alt={season.title}
									className="h-20 w-14 rounded-lg object-cover"
								/>
								<div>
									<h3 className="text-xl font-bold">{season.name}</h3>
									<p className="font-mono text-gray-600">{season.episode_count} Episodes</p>
								</div>
							</div>
							{expandedSeasons[season.season_number] ? (
								<ChevronUp className="h-6 w-6" />
							) : (
								<ChevronDown className="h-6 w-6" />
							)}
						</button>

						{/* Episodes List */}
						{expandedSeasons[season.season_number] && (
							<div className="border-t-2 border-white/50 p-6">
								<div className="grid gap-4">
									{season.episodes?.map((episode: any) => (
										<div
											key={episode.id}
											className="group relative rounded-lg border-2 border-white/50 bg-white/50 p-4 backdrop-blur-sm"
										>
											<div className="flex items-center justify-between">
												<div>
													<h4 className="font-bold">
														Episode {episode.episode_number} {showSpoilers ? `: ${episode.name}` : ''}
													</h4>
													{showSpoilers && (
														<p className="mt-2 font-mono text-sm text-gray-600">{episode.overview}</p>
													)}
												</div>
												<div className="flex items-center gap-2">
													{/* Quick Rating */}
													<div className="flex items-center">
														{[1, 2, 3, 4, 5].map((rating) => (
															<button
																key={rating}
																className="p-1 transition hover:scale-110"
																onClick={() => {
																	// TODO: Implement rating
																	console.log(
																		`Rate episode ${episode.episode_number} with ${rating} stars`
																	);
																}}
															>
																<Star
																	className={`h-5 w-5 ${
																		rating <= (episode.userRating || 0)
																			? 'fill-yellow-400 text-yellow-400'
																			: 'text-gray-300'
																	}`}
																/>
															</button>
														))}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
