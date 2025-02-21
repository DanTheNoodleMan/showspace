// src/services/tmdb.ts

import { TMDB_CONFIG } from '@/config/tmdb';
import { TMDBResponse, TMDBShow, TMDBErrorType, TMDBEpisode } from '@/types/tmdb';

class TMDBError extends Error {
	constructor(public statusCode: number, message: string) {
		super(message);
		this.name = 'TMDBError';
	}
}

class TMDBService {
	private static instance: TMDBService;
	private baseUrl: string;
	private headers: HeadersInit;

	private constructor() {
		this.baseUrl = TMDB_CONFIG.baseUrl;
		this.headers = {
			Accept: 'application/json',
			Authorization: `Bearer ${TMDB_CONFIG.apiToken}`,
		};
	}

	public static getInstance(): TMDBService {
		if (!TMDBService.instance) {
			TMDBService.instance = new TMDBService();
		}
		return TMDBService.instance;
	}

	private async fetchFromTMDB<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await fetch(url, {
			...options,
			headers: this.headers,
		});

		if (!response.ok) {
			const error = (await response.json()) as TMDBErrorType;
			throw new TMDBError(error.status_code, error.status_message);
		}

		return response.json() as Promise<T>;
	}

	public async getTrendingShows(timeWindow: 'day' | 'week' = 'day'): Promise<TMDBResponse<TMDBShow>> {
		return this.fetchFromTMDB<TMDBResponse<TMDBShow>>(`/trending/tv/${timeWindow}?language=${TMDB_CONFIG.defaultLanguage}`);
	}

	public async getShowDetails(id: number): Promise<TMDBShow> {
		return this.fetchFromTMDB<TMDBShow>(`/tv/${id}?language=${TMDB_CONFIG.defaultLanguage}&append_to_response=seasons`);
	}

	public async getSeasonDetails(showId: number, seasonNumber: number): Promise<{ episodes: TMDBEpisode[] }> {
		return this.fetchFromTMDB<{ episodes: TMDBEpisode[] }>(
			`/tv/${showId}/season/${seasonNumber}?language=${TMDB_CONFIG.defaultLanguage}`
		);
	}
}

export const tmdbService = TMDBService.getInstance();
