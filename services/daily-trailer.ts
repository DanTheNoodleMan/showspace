// /services/daily-trailer.ts
import { TMDB_CONFIG } from "@/config/tmdb";
import { createClient } from "@/lib/supabase/server";
import { addDays, startOfDay, isBefore, isAfter } from "date-fns";

interface TMDBMovieVideo {
	id: string;
	key: string;
	name: string;
	site: string;
	type: string;
}

interface DailyMovie {
	id: number;
	title: string;
	trailerKey: string;
	rating: number;
	releaseDate: string;
	posterPath: string | null;
	dateFor: string;
}

// Gets the daily movie trailer challenge for the current user's local date
export async function getDailyMovie(clientDate?: string): Promise<DailyMovie> {
	const supabase = await createClient();

	const targetDate = clientDate || new Date().toISOString().split("T")[0];

	// Check if we already have a movie for today in our history
	const { data: existingMovie } = await supabase
		.from("daily_movie_history")
		.select("movie_id, movie_title, trailer_key, rating, release_date, poster_path")
		.eq("shown_date", targetDate)
		.single();

	if (existingMovie) {
		return {
			id: existingMovie.movie_id,
			title: existingMovie.movie_title,
			trailerKey: existingMovie.trailer_key,
			rating: existingMovie.rating,
			releaseDate: existingMovie.release_date,
			posterPath: existingMovie.poster_path,
			dateFor: targetDate,
		};
	}
	// If no existing movie select a new movie for today
	const movie = await selectDailyMovie(targetDate);

	// Store this movie in our history
	await supabase.from("daily_movie_history").insert({
		movie_id: movie.id,
		movie_title: movie.title,
		trailer_key: movie.trailerKey,
		rating: movie.rating,
		release_date: movie.releaseDate,
		poster_path: movie.posterPath,
		shown_date: targetDate,
	});

	return movie;
}

async function selectDailyMovie(dateString: string): Promise<DailyMovie> {
	// Simple hash function to generate a number from the date string
	const hash = dateString.split("").reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);

	// Get a list of movie IDs we've shown in the last 100 days to avoid repeats
	const supabase = await createClient();
	const { data: recentMovies } = await supabase
		.from("daily_movie_history")
		.select("movie_id")
		.order("shown_date", { ascending: false })
		.limit(100);

	const recentMovieIds = recentMovies?.map((m) => m.movie_id) || [];

	// Use the hash to select a page of popular movies (between 1 and 50)
	const page = Math.abs(hash % 50) + 1;

	// Fetch a page of popular movies
	const movieListResponse = await fetch(`${TMDB_CONFIG.baseUrl}/movie/popular?language=en-US&page=${page}`, {
		headers: {
			Authorization: `Bearer ${TMDB_CONFIG.apiToken}`,
			Accept: "application/json",
		},
	});

	if (!movieListResponse.ok) {
		throw new Error("Failed to fetch popular movies");
	}

	const movieList = await movieListResponse.json();

	// Filter out any movies we've shown recently
	const eligibleMovies = movieList.results.filter((movie: any) => !recentMovieIds.includes(movie.id));

	// If we somehow have no eligible movies, use the original list
	const moviesPool = eligibleMovies.length > 0 ? eligibleMovies : movieList.results;

	// Use the hash to select a movie from the filtered list
	const movieIndex = Math.abs(hash) % moviesPool.length;
	const selectedMovie = moviesPool[movieIndex];

	const videoResponse = await fetch(`${TMDB_CONFIG.baseUrl}/movie/${selectedMovie.id}/videos?language=en-US`, {
		headers: {
			Authorization: `Bearer ${TMDB_CONFIG.apiToken}`,
			Accept: "application/json",
		},
	});

	if (!videoResponse.ok) {
		throw new Error("Failed to fetch movie videos");
	}

	const videoList = await videoResponse.json();

	// Find a trailer in the results since it returns different types of videos
	const trailer =
		videoList.results.find((video: TMDBMovieVideo) => video.type === "Trailer" && video.site === "YouTube") || videoList.results[0];

	if (!trailer) {
		throw new Error("No trailer found for today's movie");
	}

	const rating = Math.round(selectedMovie.vote_average * 10);

	return {
		id: selectedMovie.id,
		title: selectedMovie.title,
		trailerKey: trailer.key,
		rating,
		releaseDate: selectedMovie.release_date,
		posterPath: selectedMovie.poster_path,
		dateFor: dateString,
	};
}
