"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../trpc/react";

interface MovieModalProps {
    open: boolean;
    onClose: () => void;
    movieId: number;
    inWatchlist: boolean;
    canEdit: boolean;
    onAddToWatchlist: () => void;
    onRemoveFromWatchlist: () => void;
    isPending?: boolean;
    useModalNavigation: boolean;
}

function useIsMobile() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
}

export default function MovieModal({
    open,
    onClose,
    movieId,
    inWatchlist,
    canEdit,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    isPending,
    useModalNavigation = true,
}: MovieModalProps) {
    const router = useRouter();
    const previousPath = useRef<string | null>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!useModalNavigation) return;
        if (open) {
            previousPath.current = window.location.pathname + window.location.search;
            window.history.pushState({}, "", `/movies/${movieId}`);
        } else if (previousPath.current) {
            window.history.replaceState({}, "", previousPath.current);
        }
    }, [open, movieId, router, useModalNavigation]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    const { data, isLoading, error } = api.movie.tmdbMovie.useQuery(
        { id: movieId },
        { enabled: open },
    );

    if (!open) return null;

    const { details, credits, externalIds } = data ?? {};

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
        >
            {/* Backdrop image */}
            {details?.backdrop_path ? (
                <img
                    src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                    alt="Backdrop"
                    className="absolute inset-0 z-0 h-full w-full object-cover blur-sm brightness-50"
                    style={{ pointerEvents: "none" }}
                />
            ) : (
                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-[var(--ctp-base)] to-[var(--ctp-surface1)] blur-sm brightness-50" />
            )}
            {/* Overlay for readability */}
            <div className="absolute inset-0 z-10 bg-black/70" />
            <div
                className="relative z-20 mx-2 max-h-screen w-full max-w-4xl overflow-y-auto rounded-lg bg-[var(--ctp-base)] p-4 shadow-lg sm:mx-0 sm:max-w-4xl sm:p-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    ref={(btn) => {
                        if (btn && open) btn.focus();
                    }}
                    className="absolute top-2 right-2 p-2 text-2xl text-[var(--ctp-subtext0)] hover:text-[var(--ctp-red)] sm:top-4 sm:right-4 sm:p-0 sm:text-3xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <span className="text-lg text-[var(--ctp-lavender)]">
                            Loading...
                        </span>
                    </div>
                ) : error || !data ? (
                    <div className="flex h-64 items-center justify-center">
                        <span className="text-lg text-[var(--ctp-red)]">
                            Failed to load movie data
                        </span>
                    </div>
                ) : details ? (
                    <div>
                        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start">
                            <div className="relative">
                                <img
                                    src={
                                        details.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                                            : ""
                                    }
                                    alt={details.title}
                                    className="aspect-[2/3] max-h-[320px] w-36 max-w-full rounded-lg border-4 border-[var(--ctp-surface1)] bg-[var(--ctp-surface1)] object-cover shadow-lg sm:max-h-[600px] sm:w-64"
                                />
                            </div>
                            <div className="flex flex-1 flex-col">
                                {/* Watchlist Add/Remove Button */}

                                <h2 className="mb-4 flex items-center gap-4 text-3xl font-bold text-white">
                                    {details.title}
                                    <span className="text-xl font-normal text-gray-300">
                                        {details.release_date?.slice(0, 4)}
                                    </span>
                                    {canEdit &&
                                        (inWatchlist ? (
                                            <button
                                                className="ml-4 rounded border-2 border-[var(--ctp-red)] bg-[var(--ctp-base)] px-3 py-1 text-base font-bold text-[var(--ctp-red)] shadow hover:bg-[var(--ctp-red)] hover:text-white focus:ring-2 focus:ring-[var(--ctp-red)] focus:outline-none disabled:opacity-50"
                                                onClick={onRemoveFromWatchlist}
                                                disabled={isPending}
                                                aria-label="Remove from Watchlist"
                                            >
                                                Remove from Watchlist
                                            </button>
                                        ) : (
                                            <button
                                                className="ml-4 rounded border-2 border-[var(--ctp-lavender)] bg-[var(--ctp-base)] px-3 py-1 text-base font-bold text-[var(--ctp-lavender)] shadow hover:bg-[var(--ctp-lavender)] hover:text-white focus:ring-2 focus:ring-[var(--ctp-lavender)] focus:outline-none disabled:opacity-50"
                                                onClick={onAddToWatchlist}
                                                disabled={isPending}
                                                aria-label="Add to Watchlist"
                                            >
                                                Add to Watchlist
                                            </button>
                                        ))}
                                </h2>
                                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-white">
                                    {details.genres?.map((g) => (
                                        <span
                                            key={g.id}
                                            className="rounded bg-[var(--ctp-surface1)] px-2 py-1"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                    {details.runtime ? (
                                        <span className="rounded bg-[var(--ctp-surface1)] px-2 py-1">
                                            {Math.floor(details.runtime / 60)}h {details.runtime % 60}
                                            m
                                        </span>
                                    ) : null}

                                    <span className="rounded bg-[var(--ctp-surface1)] px-2 py-1">
                                        ⭐ {details.vote_average?.toFixed(1)}
                                    </span>
                                </div>
                                <p className="mb-6 max-w-2xl text-lg leading-relaxed text-white">
                                    {details.overview}
                                </p>
                                <div className="mb-2">
                                    <span className="font-bold text-[var(--ctp-lavender)]">
                                        Top Cast:
                                    </span>
                                    <div className="scrollbar-thin scrollbar-thumb-[var(--ctp-surface1)] scrollbar-track-transparent mt-2 flex gap-4 overflow-x-auto pb-2">
                                        {credits?.cast
                                            ?.slice(isMobile ? 0 : 0, isMobile ? 4 : 5)
                                            .map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex w-20 flex-shrink-0 flex-col items-center sm:w-24"
                                                >
                                                    {c.profile_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                                                            alt={c.name}
                                                            className="mb-1 h-16 w-16 rounded-full border border-[var(--ctp-surface1)] bg-[var(--ctp-surface1)] object-cover sm:h-20 sm:w-20"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--ctp-surface1)] bg-[var(--ctp-surface1)] text-2xl font-bold text-[var(--ctp-lavender)] sm:h-20 sm:w-20 sm:text-3xl"
                                                            aria-label={c.name}
                                                        >
                                                            {c.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="line-clamp-2 text-center text-xs text-[var(--ctp-text)]">
                                                        {c.name}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold text-[var(--ctp-lavender)]">
                                        Director:
                                    </span>
                                    <span className="ml-2 text-[var(--ctp-text)]">
                                        {credits?.crew
                                            ?.filter((c) => c.job === "Director")
                                            .map((c) => c.name)
                                            .join(", ")}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold text-[var(--ctp-lavender)]">
                                        Writer:
                                    </span>
                                    <span className="ml-2 text-[var(--ctp-text)]">
                                        {credits?.crew
                                            ?.filter(
                                                (c) => c.job === "Writer" || c.job === "Screenplay",
                                            )
                                            .map((c) => c.name)
                                            .join(", ")}
                                    </span>
                                </div>
                                <div className="mb-2 flex gap-4">
                                    {externalIds?.imdb_id && (
                                        <a
                                            href={`https://www.imdb.com/title/${externalIds.imdb_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[var(--ctp-blue)] underline"
                                        >
                                            IMDB
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.themoviedb.org/movie/${details.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--ctp-blue)] underline"
                                    >
                                        TMDb
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
