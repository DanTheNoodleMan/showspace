// /types/tmdb.ts
import { Show } from './index';

export interface TMDBResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export interface TMDBShow {
	id: number;
	name: string;
	original_name: string;
	overview: string;
	first_air_date: string;
	poster_path: string;
	backdrop_path: string | null;
	vote_average: number;
	vote_count: number;
	popularity: number;
	original_language: string;
	genre_ids: number[];
	media_type: string;
	origin_country: string[];
	adult: boolean;
	status: string;
	rating: number;
	seasons: TMDBSeason[];
}

export interface TMDBErrorType {
	status_message: string;
	status_code: number;
}

// Map TMDB show to our internal Show type
export const mapTMDBShowToShow = (tmdbShow: TMDBShow): Show => ({
	id: tmdbShow.id.toString(),
	tmdbId: tmdbShow.id,
	title: tmdbShow.name,
	overview: tmdbShow.overview,
	posterPath: tmdbShow.poster_path,
	firstAirDate: new Date(tmdbShow.first_air_date),
	rating: tmdbShow.vote_average,
	status: tmdbShow.status,
	genres: [],
	originCountry: tmdbShow.origin_country,
});

export interface TMDBSeason {
	id: number;
	name: string;
	overview: string;
	season_number: number;
	air_date: string;
	episode_count: number;
	poster_path: string | null;
}

export interface TMDBEpisode {
	id: number;
	name: string;
	overview: string;
	episode_number: number;
	air_date: string;
	still_path: string | null;
	runtime: number;
}
