// src/app/(auth)/signup/page.tsx
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		redirect('/');
	}

	return (
		<div className="w-full max-w-md">
			<AuthForm type="signup" />
		</div>
	);
}
