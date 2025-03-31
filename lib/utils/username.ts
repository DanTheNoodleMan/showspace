export function formatUsername(username: string): string {
	return username.toLowerCase();
}

export function formatDisplayUsername(username: string): string {
	// This can be used if you want to show usernames in a specific format
	return username;
}

export async function getUserProfile(supabase: any, username: string) {
	const formattedUsername = formatUsername(username);

	const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", formattedUsername).single();

	if (error || !profile) {
		return null;
	}

	return profile;
}
