// src/services/daily-trailer.ts

import { TMDB_CONFIG } from '@/config/tmdb';

interface TMDBMovieVideo {
	id: string;
	key: string;
	name: string;
	site: string;
	type: string;
}

// This function deterministically selects a movie based on the date
export async function getDailyMovie() {
	// Use today's date to seed the random selection
	const today = new Date();
	const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

	// Simple hash function to generate a number from the date string
	const hash = dateString.split('').reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);

	// Use the hash to select a page of popular movies
	const page = Math.abs(hash % 20) + 1; // Get a page between 1 and 20

	// Fetch a page of popular movies
	const movieListResponse = await fetch(`${TMDB_CONFIG.baseUrl}/movie/popular?language=en-US&page=${page}`, {
		headers: {
			Authorization: `Bearer ${TMDB_CONFIG.apiToken}`,
			Accept: 'application/json',
		},
	});

	if (!movieListResponse.ok) {
		throw new Error('Failed to fetch popular movies');
	}

	const movieList = await movieListResponse.json();

	console.log('movieList', movieList);

	// Use the hash to select a movie from the page
	const movieIndex = Math.abs(hash) % movieList.results.length;
	const selectedMovie = movieList.results[movieIndex];

	// Fetch trailer for the selected movie
	const videoResponse = await fetch(`${TMDB_CONFIG.baseUrl}/movie/${selectedMovie.id}/videos?language=en-US`, {
		headers: {
			Authorization: `Bearer ${TMDB_CONFIG.apiToken}`,
			Accept: 'application/json',
		},
	});

	if (!videoResponse.ok) {
		throw new Error('Failed to fetch movie videos');
	}

	const videoList = await videoResponse.json();
	console.log('videoList', videoList);

	// Find a trailer in the results
	const trailer =
		videoList.results.find((video: TMDBMovieVideo) => video.type === 'Trailer' && video.site === 'YouTube') || videoList.results[0];

	console.log('trailer', trailer);
	if (!trailer) {
		throw new Error("No trailer found for today's movie");
	}

	// Scale the rating from 0-10 to 0-100
	const rating = Math.round(selectedMovie.vote_average * 10);

	return {
		id: selectedMovie.id,
		title: selectedMovie.title,
		trailerKey: trailer.key,
		rating,
		releaseDate: selectedMovie.release_date,
		posterPath: selectedMovie.poster_path,
	};
}
