// app/api/tmdb/token/route.ts
import { NextResponse } from "next/server";
import { checkAuthenticatedApi } from "@/lib/auth/api-auth";

export async function GET() {
	// Check if user is authenticated first
	const { error: authError } = await checkAuthenticatedApi();
	if (authError) return authError;

	return NextResponse.json({
		token: process.env.TMDB_API_TOKEN,
	});
}
