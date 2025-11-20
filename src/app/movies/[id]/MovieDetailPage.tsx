"use client";
import type {
    TMDbMovieDetails,
    TMDbCredits,
    TMDbExternalIds,
} from "~/server/externalServices/tmdb";

import React from "react";
import WatchlistButton from "./WatchlistButton";

export default function MovieDetailPage({
    details,
    credits,
    externalIds,
    currentUserId,
}: {
    details: TMDbMovieDetails;
    credits: TMDbCredits;
    externalIds: TMDbExternalIds;
    currentUserId: number;
}) {
    return (
        <main className="min-h-screen w-full bg-[var(--ctp-base)]">
            {/* Backdrop with overlay */}
            <div className="relative h-[270px] w-full">
                {details.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                        alt="Backdrop"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[var(--ctp-base)] to-[var(--ctp-surface1)]" />
                )}
                <div className="absolute inset-0 z-10 bg-black/70" />
                {/* Main content overlays backdrop, fits in section */}
                <div className="absolute bottom-0 left-1/2 z-20 flex w-full max-w-6xl -translate-x-1/2 flex-col items-center gap-10 px-4 pb-4 md:flex-row md:items-end">
                    {/* Poster */}
                    <div className="mb-4 flex w-[160px] min-w-[120px] flex-shrink-0 items-center justify-center md:mb-0">
                        <img
                            src={
                                details.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                                    : ""
                            }
                            alt={details.title}
                            className="w-full rounded-lg border-4 border-[var(--ctp-surface1)] bg-[var(--ctp-surface1)] object-cover shadow-lg"
                        />
                    </div>
                    {/* Details Card (hero section) */}
                    <div className="flex flex-1 flex-col justify-start p-8">
                        <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold text-white drop-shadow-lg">
                            {details.title}
                            <span className="text-xl font-normal text-gray-300">
                                {details.release_date?.slice(0, 4)}
                            </span>
                            {/* Watchlist Button */}
                            <WatchlistButton
                                tmdbId={details.id}
                                currentUserId={currentUserId}
                            />
                        </h1>
                        {details.tagline && (
                            <div className="mb-4 text-lg text-white italic drop-shadow">
                                {details.tagline}
                            </div>
                        )}
                        <div className="mb-6 flex flex-wrap items-center gap-4 drop-shadow">
                            <span className="rounded bg-gray-800 px-2 py-1 text-sm text-white">
                                {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                            </span>
                            <span className="rounded bg-gray-800 px-2 py-1 text-sm text-white">
                                ⭐ {details.vote_average?.toFixed(1)}
                            </span>
                            <span className="rounded bg-gray-800 px-2 py-1 text-sm text-white">
                                {details.genres?.map((g) => g.name).join(", ")}
                            </span>
                            <span className="rounded bg-gray-800 px-2 py-1 text-sm text-white">
                                {details.release_date}
                            </span>
                            {/* Placeholder for action buttons */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Content box below hero */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <p className="mb-6 text-lg leading-relaxed text-white">
                    {details.overview}
                </p>
                <h2 className="mb-6 text-2xl font-bold text-white">Top Cast</h2>
                <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex gap-6 overflow-x-auto pb-2">
                    {credits?.cast?.slice(0, 10).map((c) => (
                        <div
                            key={c.id}
                            className="flex w-24 min-w-[80px] flex-col items-center"
                        >
                            {c.profile_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                                    alt={c.name}
                                    className="mb-2 aspect-square h-20 w-20 rounded-full border-2 border-gray-700 object-cover"
                                />
                            ) : (
                                <div className="mb-2 flex aspect-square h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-2xl font-bold text-white">
                                    {c.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="line-clamp-2 text-center text-xs text-white">
                                {c.name}
                            </span>
                            <span className="line-clamp-2 text-center text-xs text-gray-400">
                                {c.character}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mb-8 grid max-w-2xl grid-cols-2 gap-4">
                    <div>
                        <h3 className="mb-2 text-lg font-semibold text-white">Director</h3>
                        <div className="text-white">
                            {credits?.crew
                                ?.filter((c) => c.job === "Director")
                                .map((c) => c.name)
                                .join(", ")}
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-lg font-semibold text-white">Writer</h3>
                        <div className="text-white">
                            {credits?.crew
                                ?.filter((c) => c.job === "Writer" || c.job === "Screenplay")
                                .map((c) => c.name)
                                .join(", ")}
                        </div>
                    </div>
                </div>
                <div className="mb-6 flex gap-6">
                    {externalIds?.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${externalIds.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline hover:text-yellow-400"
                        >
                            IMDB
                        </a>
                    )}
                    <a
                        href={`https://www.themoviedb.org/movie/${details.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline hover:text-blue-400"
                    >
                        TMDb
                    </a>
                </div>
            </section>
        </main>
    );
}
