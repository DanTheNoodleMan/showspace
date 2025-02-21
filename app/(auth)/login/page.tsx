// /app/(auth)/login/page.tsx
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		redirect('/');
	}

	return (
		<div className="w-full max-w-md">
			<AuthForm type="login" />
		</div>
	);
}
