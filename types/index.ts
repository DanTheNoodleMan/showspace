// types/index.ts

// User model
export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	bio?: string;
	avatarUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Review model
export interface Review {
	id: string;
	userId: string;
	showId: string;
	content: string;
	containsSpoilers: boolean;
	likes: number;
	createdAt: Date;
	updatedAt: Date;
}

// List model
export interface List {
	id: string;
	userId: string;
	title: string;
	description?: string;
	isPrivate: boolean;
	shows: Show[];
	createdAt: Date;
	updatedAt: Date;
}

// Watch Status
export interface WatchStatus {
	id: string;
	userId: string;
	showId: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Genre {
	id: number;
	name: string;
}

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	bio?: string;
	avatarUrl?: string;
}

export interface Show {
	id: string;
	tmdbId: number;
	title: string;
	originalName: string;
	overview: string;
	posterPath: string;
	firstAirDate: Date;
	status: string;
	genres: Genre[];
	rating: number;
	originCountry: string[];
	popularity: number;
}

export interface Review {
	id: string;
	userId: string;
	showId: string;
	content: string;
	containsSpoilers: boolean;
}
