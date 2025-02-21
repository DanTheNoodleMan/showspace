// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
				supabaseResponse = NextResponse.next({
					request,
				});
				cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
			},
		},
	});

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protected routes
	const protectedRoutes = ['/lists', '/settings', '/profile', '/discover'];

	if (!user && protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
		// Redirect to login if accessing protected route without user
		const redirectUrl = new URL('/login', request.url);
		redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// Auth routes (when already logged in)
	const authRoutes = ['/login', '/signup'];

	if (authRoutes.includes(request.nextUrl.pathname)) {
		if (user) {
			// Redirect to home if accessing auth routes with session
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	return supabaseResponse;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public (public files)
		 * - api (API routes)
		 */
		'/((?!_next/static|_next/image|favicon.ico|public|api).*)',
	],
};
