"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	Star,
	Trophy,
	Calendar,
	Clock,
	TrendingUp,
	Loader2,
	Info,
	ChevronDown,
	PlayCircle,
	ThumbsUp,
	Medal,
	AlertTriangle,
	RefreshCw,
} from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { formatDistanceToNow } from "date-fns";

interface DailyTrailerGameProps {
	movie: {
		id: number;
		title: string;
		trailerKey: string;
		rating: number;
		releaseDate: string;
		posterPath: string | null;
	};
}

interface GameState {
	hasGuessed: boolean;
	guess: number;
	result: "correct" | "close" | "incorrect" | null;
	streak: number;
	isLoaded: boolean;
}

// Separate game state management
function useGameState(movieId: number) {
	const [gameState, setGameState] = useState<GameState>({
		hasGuessed: false,
		guess: 50,
		result: null,
		streak: 0,
		isLoaded: false,
	});
	const { user } = useAuth();
	const supabase = createClient();

	useEffect(() => {
		async function loadGameState() {
			if (!user) {
				setGameState((prev) => ({ ...prev, isLoaded: true }));
				return;
			}
			try {
				// First get the user's current streak
				const { data: userData } = await supabase.from("profiles").select("current_streak").eq("id", user.id).single();

				const { data: existingGuess } = await supabase
					.from("daily_game_guesses")
					.select("*")
					.eq("user_id", user.id)
					.eq("movie_id", movieId)
					.single();

				if (existingGuess) {
					const difference = Math.abs(existingGuess.guess - existingGuess.actual_rating);
					let result: "correct" | "close" | "incorrect";

					if (difference <= 5) result = "correct";
					else if (difference <= 15) result = "close";
					else result = "incorrect";

					setGameState({
						hasGuessed: true,
						guess: existingGuess.guess,
						result,
						streak: userData?.current_streak || 0,
						isLoaded: true,
					});
				} else {
					setGameState({
						hasGuessed: false,
						guess: 50,
						result: null,
						streak: userData?.current_streak || 0,
						isLoaded: true,
					});
				}
			} catch (error) {
				console.error("Error loading game state:", error);
				setGameState((prev) => ({ ...prev, isLoaded: true }));
			}
		}

		loadGameState();
	}, [user, movieId, supabase]);

	return [gameState, setGameState] as const;
}

// Separate leaderboard management
function useLeaderboard() {
	const [leaderboard, setLeaderboard] = useState<Array<{ username: string; current_streak: number }>>([]);
	const supabase = createClient();

	const refreshLeaderboard = async () => {
		const { data } = await supabase
			.from("profiles")
			.select("username, current_streak")
			.order("current_streak", { ascending: false })
			.limit(10);

		if (data) setLeaderboard(data);
	};

	useEffect(() => {
		refreshLeaderboard();
	}, []);

	return [leaderboard, refreshLeaderboard] as const;
}

export function DailyTrailerGame({ movie }: DailyTrailerGameProps) {
	const { user } = useAuth();
	const router = useRouter();
	const supabase = createClient();
	const [gameState, setGameState] = useGameState(movie.id);
	const [leaderboard, refreshLeaderboard] = useLeaderboard();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<"info" | "leaderboard">("info");
	const [rulesExpanded, setRulesExpanded] = useState(false);
	const [remainingTime, setRemainingTime] = useState<string>("");
	const [showSpoilers, setShowSpoilers] = useState(false);

	// Calculate remaining time
	useEffect(() => {
		const calculateRemainingTime = () => {
			const now = new Date();
			const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
			const diffMs = tomorrow.getTime() - now.getTime();
			const diffHrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
			const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
			setRemainingTime(`${diffHrs}h ${diffMins}m`);
		};

		calculateRemainingTime();
		const timer = setInterval(calculateRemainingTime, 60000);
		return () => clearInterval(timer);
	}, []);

	const handleGuessChange = (value: number | number[]) => {
		if (!gameState.hasGuessed && typeof value === "number") {
			setGameState((prev) => ({ ...prev, guess: value }));
		}
	};

	const handleSubmitGuess = async () => {
		if (isSubmitting || !user || !gameState.isLoaded) {
			if (!user) router.push("/login?redirectTo=/daily-trailer");
			return;
		}

		setIsSubmitting(true);

		try {
			const difference = Math.abs(gameState.guess - movie.rating);
			let result: "correct" | "close" | "incorrect";
			let streakChange = 0;

			if (difference <= 5) {
				result = "correct";
				streakChange = 1;
			} else if (difference <= 15) {
				result = "close";
				streakChange = 0;
			} else {
				result = "incorrect";
				streakChange = -gameState.streak;
			}

			await supabase.from("daily_game_guesses").insert({
				user_id: user.id,
				movie_id: movie.id,
				guess: gameState.guess,
				actual_rating: movie.rating,
				difference,
				result,
			});

			const newStreak = Math.max(0, gameState.streak + streakChange);
			// Update the database first
			await Promise.all([
				supabase.from("daily_game_guesses").insert({
					user_id: user.id,
					movie_id: movie.id,
					guess: gameState.guess,
					actual_rating: movie.rating,
					difference,
					result,
				}),
				supabase.from("profiles").update({ current_streak: newStreak }).eq("id", user.id),
			]);

			setGameState((prev) => ({
				...prev,
				hasGuessed: true,
				result,
				streak: newStreak,
			}));

			setActiveTab("info");
			await refreshLeaderboard();
		} catch (error) {
			console.error("Error submitting guess:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col gap-8">
			{/* Rules Section */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="rounded-xl border-4 border-white/50 bg-white/90 p-3 md:p-6 shadow-xl backdrop-blur-lg"
			>
				<button
					onClick={() => setRulesExpanded(!rulesExpanded)}
					className="flex items-center justify-between w-full group transition-all duration-300 cursor-pointer"
				>
					<div className="flex items-center gap-2 md:ml-4">
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							className="bg-purple-100 p-1.5 rounded-full group-hover:bg-purple-200 transition-colors duration-300"
						>
							<Info className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
						</motion.div>
						<h2 className="text-md md:text-xl font-black uppercase tracking-wider text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
							HOW TO PLAY
						</h2>
					</div>
					<motion.div
						initial={false}
						animate={{ rotate: rulesExpanded ? 180 : 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="bg-purple-100 p-1.5 md:mr-4 rounded-full group-hover:bg-purple-200 transition-colors duration-300 hidden md:block"
					>
						<ChevronDown className="h-5 w-5 text-purple-500" />
					</motion.div>
				</button>

				<AnimatePresence>
					{rulesExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="overflow-hidden"
						>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="overflow-hidden"
							>
								<motion.div
									initial={{ y: -20 }}
									animate={{ y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
									className="mt-4 space-y-3"
								>
									{/* Rule 1 */}
									<motion.div
										className="rounded-lg border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 p-3 m-4 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-400 text-white font-bold shadow-sm">
												1
											</div>
											<p className="font-medium text-gray-800 flex-1">Watch the movie trailer below</p>
											<PlayCircle className="h-6 w-6 text-pink-500 hidden md:block" />
										</div>
									</motion.div>

									{/* Rule 2 */}
									<motion.div
										className="rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 m-4 p-3 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400 text-white font-bold shadow-sm">
												2
											</div>
											<p className="font-medium text-gray-800 flex-1">Guess the movie's rating out of 100</p>
											<Star className="h-6 w-6 text-purple-500 hidden md:block" />
										</div>
									</motion.div>

									{/* Rule 3 */}
									<motion.div
										className="rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-teal-50 m-4 p-3 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400 text-white font-bold shadow-sm">
												3
											</div>
											<div className="flex-1">
												<p className="font-medium text-gray-800">
													Within 5 points: <span className="font-black text-green-600">CORRECT!</span>
												</p>
												<p className="text-sm text-green-600 mt-1">+1 to your streak</p>
											</div>
											<ThumbsUp className="h-6 w-6 text-green-500 hidden md:block" />
										</div>
									</motion.div>

									{/* Rule 4 */}
									<motion.div
										className="rounded-lg border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 m-4 p-3 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-white font-bold shadow-sm">
												4
											</div>
											<div className="flex-1">
												<p className="font-medium text-gray-800">
													Within 15 points: <span className="font-black text-yellow-600">CLOSE!</span>
												</p>
												<p className="text-sm text-yellow-600 mt-1">Streak maintained</p>
											</div>
											<Medal className="h-6 w-6 text-yellow-500 hidden md:block" />
										</div>
									</motion.div>

									{/* Rule 5 */}
									<motion.div
										className="rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 m-4 p-3 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400 text-white font-bold shadow-sm">
												5
											</div>
											<div className="flex-1">
												<p className="font-medium text-gray-800">
													More than 15 points off: <span className="font-black text-red-600">INCORRECT</span>
												</p>
												<p className="text-sm text-red-600 mt-1">Streak reset to 0</p>
											</div>
											<AlertTriangle className="h-6 w-6 text-red-500 hidden md:block" />
										</div>
									</motion.div>

									{/* Rule 6 */}
									<motion.div
										className="rounded-lg border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 m-4 p-3 shadow-sm"
										whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-white font-bold shadow-sm">
												6
											</div>
											<p className="font-medium text-gray-800 flex-1">Come back tomorrow for a new challenge!</p>
											<RefreshCw className="h-6 w-6 text-cyan-500 hidden md:block" />
										</div>
									</motion.div>
								</motion.div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Game Container */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="relative overflow-hidden rounded-xl border-4 border-white/50 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-6 shadow-xl backdrop-blur-lg"
			>
				{/* Trailer Video */}
				<div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-black">
					<iframe
						width="100%"
						height="100%"
						src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0&controls=1`}
						title="Movie Trailer"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</div>

				{/* Game Content */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Left Column - Guessing */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-black uppercase tracking-wider text-gray-800">GUESS THE RATING</h2>

						<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
							<div className="mb-4 flex justify-between">
								<span className="font-mono text-sm">0</span>
								<span className="font-mono text-sm">50</span>
								<span className="font-mono text-sm">100</span>
							</div>

							<Slider
								min={0}
								max={100}
								value={gameState.guess}
								onChange={handleGuessChange}
								railStyle={{ backgroundColor: "#E9D5FF", height: 10 }}
								trackStyle={{ backgroundColor: "#A855F7", height: 10 }}
								handleStyle={{
									borderColor: "#7E22CE",
									height: 24,
									width: 24,
									marginTop: -7,
									backgroundColor: "#ffffff",
								}}
								disabled={gameState.hasGuessed}
							/>

							<div className="mt-4 text-center">
								<span className="text-3xl font-black text-purple-600">{gameState.guess}</span>
								<span className="text-xl font-bold text-purple-400">/100</span>
							</div>
						</div>

						{!gameState.hasGuessed ? (
							<motion.button
								onClick={handleSubmitGuess}
								disabled={isSubmitting}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-0.5 focus:outline-none cursor-pointer"
							>
								<span className="relative flex items-center justify-center rounded-md bg-white px-8 py-3 text-center font-bold tracking-wide text-gray-900 transition group-hover:bg-transparent group-hover:text-white">
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
									{isSubmitting ? "SUBMITTING..." : "SUBMIT GUESS"}
								</span>
							</motion.button>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className={`rounded-lg border-2 p-4 text-center ${
									gameState.result === "correct"
										? "border-green-300 bg-green-50"
										: gameState.result === "close"
										? "border-yellow-300 bg-yellow-50"
										: "border-red-300 bg-red-50"
								}`}
							>
								{/* Result content */}
								<h3 className="text-lg font-bold">
									{gameState.result === "correct"
										? "CORRECT!"
										: gameState.result === "close"
										? "CLOSE!"
										: "TRY AGAIN TOMORROW!"}
								</h3>
								<p className="text-sm">
									{gameState.result === "correct"
										? "You guessed within 5 points of the actual rating!"
										: gameState.result === "close"
										? "You were within 15 points of the actual rating."
										: "Your guess was more than 15 points off."}
								</p>
								<div className="mt-2 flex justify-center gap-4">
									<div className="flex items-center">
										<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
										<span className="ml-1 font-bold">{movie.rating}/100</span>
									</div>
									<div className="flex items-center">
										<Trophy className="h-5 w-5 text-purple-500" />
										<span className="ml-1 font-bold">Streak: {gameState.streak}</span>
									</div>
								</div>
							</motion.div>
						)}

						{/* Next trailer countdown */}
						<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-4">
							<h3 className="mb-2 font-bold text-purple-600">Next Trailer In</h3>
							<div className="flex items-center gap-2">
								<Clock className="h-5 w-5 text-purple-500" />
								<span className="font-mono">{remainingTime}</span>
							</div>
						</div>
					</div>

					{/* Right Column - Results/Leaderboard */}
					<div className="flex flex-col gap-4">
						{gameState.hasGuessed && (
							<div className="flex rounded-lg border-2 border-purple-300 bg-white/50 p-1">
								<motion.button
									onClick={() => setActiveTab("info")}
									whileTap={{ scale: 0.97 }}
									className={`flex-1 rounded-md py-2 font-bold transition cursor-pointer ${
										activeTab === "info" ? "bg-purple-500 text-white" : "hover:bg-purple-100"
									}`}
								>
									MOVIE INFO
								</motion.button>
								<motion.button
									onClick={() => setActiveTab("leaderboard")}
									whileTap={{ scale: 0.97 }}
									className={`flex-1 rounded-md py-2 font-bold transition cursor-pointer ${
										activeTab === "leaderboard" ? "bg-purple-500 text-white" : "hover:bg-purple-100"
									}`}
								>
									LEADERBOARD
								</motion.button>
							</div>
						)}

						{/* Content based on active tab */}
						<AnimatePresence mode="wait">
							{activeTab === "info" && gameState.hasGuessed ? (
								<motion.div
									key="info"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.3 }}
								>
									<h2 className="text-xl font-black uppercase tracking-wider text-gray-800">{movie.title}</h2>

									<div className="relative h-auto w-full mt-4">
										<div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur" />
										<img
											src={
												movie.posterPath
													? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
													: "/movie-placeholder.jpg"
											}
											alt={movie.title}
											className="relative h-full w-full rounded-lg object-cover"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4 mt-4">
										<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-3 text-center">
											<Calendar className="mx-auto h-5 w-5 text-purple-500" />
											<div className="mt-1 text-sm font-bold text-purple-600">
												{formatDistanceToNow(new Date(movie.releaseDate), { addSuffix: true })}
											</div>
											<div className="text-xs text-gray-600">Released</div>
										</div>
										<div className="rounded-lg border-2 border-purple-300 bg-white/50 p-3 text-center">
											<TrendingUp className="mx-auto h-5 w-5 text-purple-500" />
											<div className="mt-1 text-sm font-bold text-purple-600">{movie.rating}</div>
											<div className="text-xs text-gray-600">Rating</div>
										</div>
									</div>
								</motion.div>
							) : (
								<motion.div
									key="leaderboard"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.3 }}
								>
									<h2 className="text-xl font-black uppercase tracking-wider text-gray-800">LEADERBOARD</h2>
									<div className="flex-1 rounded-lg border-2 border-purple-300 bg-white/50 p-4 mt-4">
										<div className="space-y-2">
											{leaderboard.length > 0 ? (
												leaderboard.map((entry, index) => (
													<motion.div
														key={index}
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
														className="flex items-center justify-between border-b border-purple-100 pb-2 last:border-0"
													>
														<div className="flex items-center gap-2">
															<span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-400 text-xs font-bold text-white">
																{index + 1}
															</span>
															<span className="font-bold">{entry.username}</span>
														</div>
														<div className="flex items-center gap-1">
															<Trophy
																className={`h-4 w-4 ${index < 3 ? "text-yellow-400" : "text-purple-400"}`}
															/>
															<span className="font-mono">{entry.current_streak}</span>
														</div>
													</motion.div>
												))
											) : (
												<div className="text-center font-mono text-gray-500">No players yet. Be the first!</div>
											)}
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
