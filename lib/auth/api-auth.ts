// /lib/auth/auth-utils.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function checkAuthenticatedApi() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return {
			error: new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
			user: null,
		};
	}

	return { error: null, user };
}
