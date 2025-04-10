// /config/tmdb.ts
export const TMDB_CONFIG = {
	baseUrl: "https://api.themoviedb.org/3",
	imageBaseUrl: "https://image.tmdb.org/t/p",
	apiToken: process.env.TMDB_API_TOKEN,
	defaultLanguage: "en-US",
} as const;

export const TMDB_IMAGE_SIZES = {
	icon: {
		small: "w45",
		medium: "w92",
		large: "w154",
		original: "original",
	},
	poster: {
		small: "w185",
		medium: "w342",
		large: "w500",
		original: "original",
	},
	backdrop: {
		small: "w300",
		medium: "w780",
		large: "w1280",
		original: "original",
	},
} as const;

export const getTMDBImageUrl = (
	path: string | null,
	type: "icon" | "poster" | "backdrop" = "poster",
	size: keyof typeof TMDB_IMAGE_SIZES.poster = "medium"
): string | null => {
	if (!path) return null;
	return `${TMDB_CONFIG.imageBaseUrl}/${TMDB_IMAGE_SIZES[type][size]}${path}`;
};
