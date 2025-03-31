import React from "react";
import { Show } from "@/types";
import { getTMDBImageUrl } from "@/config/tmdb";
import { Star } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { useRouter } from "next/navigation";
import { QuickAddToList } from "@/components/lists/QuickAddToList";

interface ShowCardProps {
	show: Show;
}

export const ShowCard = ({ show }: ShowCardProps) => {
	const router = useRouter();

	const renderCountryFlag = (countryCode: string) => {
		const code = countryCode.toUpperCase();
		const FlagComponent = (Flags as { [key: string]: React.ComponentType })[code];
		return FlagComponent ? (
			<div className="h-4 w-6 rounded-sm" title={`${code} flag`}>
				<FlagComponent />
			</div>
		) : null;
	};

	return (
		<div
			className="group relative cursor-pointer"
			onClick={() => {
				router.push(`/shows/${show.id}`);
				window.scrollTo(0, 0);
			}}
		>
			{/* Glow effect */}
			<div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-75 blur transition duration-300 ease-in-out group-hover:opacity-100 group-hover:blur-md" />

			{/* Card content */}
			<div className="relative overflow-hidden rounded-xl border-2 border-white/50 bg-white/90 transition-transform duration-300 ease-in-out ">
				{/* Image container with fixed aspect ratio */}
				<div className="relative pb-[150%]">
					<img
						src={getTMDBImageUrl(show.posterPath, "poster", "large")!}
						alt={show.title}
						className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
					/>

					{/* Hover overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<div className="absolute bottom-0 p-4 text-white">
							<h3 className="mb-2 text-lg font-bold">{show.title}</h3>
							<p className="mb-2 line-clamp-2 text-sm">{show.overview}</p>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1">
									<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
									<span className="text-sm">{show.rating !== 0 ? show.rating.toFixed(1) : "N/A"}</span>
								</div>
								<div className="mr-1 flex flex-wrap gap-2">
									{show.originCountry.map((country) => (
										<div key={country} className="flex items-center gap-1">
											{renderCountryFlag(country)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
