"use client";
import React, { useState } from "react";
import MovieModal from "./MovieModal";
import { api } from "../../trpc/react";
import { toast } from "sonner";

interface MovieCardProps {
    tmdbId: number;
    posterUrl: string;
    title: string;
    className?: string;
    watchlistId?: number;
    canEdit?: boolean;
    useModalNavigation?: boolean;
}

export default function MovieCard({
    tmdbId,
    posterUrl,
    title,
    className,
    watchlistId,
    canEdit,
    useModalNavigation = true,
}: MovieCardProps) {
    // Optimistic UI state for watchlist status
    const [optimisticInWatchlist, setOptimisticInWatchlist] =
        useState<boolean>(!!watchlistId);
    // Sync local state with prop after mutation/refetch
    React.useEffect(() => {
        setOptimisticInWatchlist(!!watchlistId);
    }, [watchlistId]);

    const [open, setOpen] = useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const utils = api.useUtils();
    const removeMovie = api.watchlist.removeMovie.useMutation({
        onSuccess: async () => {
            await utils.watchlist.getMyWatchlistForUser.invalidate();
        },
    });
    const addMovie = api.watchlist.addMovie.useMutation({
        onSuccess: async () => {
            await utils.watchlist.getMyWatchlistForUser.invalidate();
        },
    });

    // Prefetch movie data on hover/focus
    const handlePrefetch = () => {
        void utils.movie.tmdbMovie.prefetch({ id: tmdbId });
    };

    const handleOpen = () => {
        setOpen(true);
        cardRef.current?.blur();
    };
    return (
        <>
            <div
                ref={cardRef}
                className={`group relative aspect-[2/3] h-full flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-xl transition-transform hover:scale-105 ${className ?? ""}`}
                onClick={handleOpen}
                onMouseEnter={handlePrefetch}
                onFocus={handlePrefetch}
                role="button"
                tabIndex={0}
                aria-label={`Show details for ${title}`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleOpen();
                }}
            >
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={title}
                        className="h-full w-full bg-black object-contain"
                        draggable={false}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--ctp-surface1)]">
                        <span
                            className="px-2 text-center text-2xl font-extrabold text-[var(--ctp-lavender)]"
                            style={{ fontFamily: "inherit", letterSpacing: "0.05em" }}
                        >
                            {title}
                        </span>
                    </div>
                )}
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <span className="text-lg font-bold text-[var(--ctp-lavender)] drop-shadow">
                        {title}
                    </span>
                </div>
                {/* Green checkmark circle, always visible except on hover/focus */}

                {optimisticInWatchlist && (
                    <div className="pointer-events-none absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-600 bg-green-500 text-2xl font-extrabold text-white opacity-70 shadow-md transition-opacity group-focus-within:opacity-0 group-hover:opacity-0">
                        <span className="text-2xl font-extrabold">&#10003;</span>
                    </div>
                )}
                {/* Red remove button, only visible on hover/focus */}
                {optimisticInWatchlist && (
                    <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <button
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--ctp-red)] bg-[var(--ctp-base)] text-2xl font-extrabold text-[var(--ctp-red)] shadow-md hover:scale-110 hover:bg-[var(--ctp-red)] hover:text-white hover:shadow-lg focus:ring-2 focus:ring-[var(--ctp-red)] focus:outline-none"
                            disabled={!canEdit}
                            aria-label="Remove from Watchlist"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOptimisticInWatchlist(false); // Optimistic update
                                void (async () => {
                                    try {
                                        await removeMovie.mutateAsync({
                                            tmdbId: tmdbId,
                                            itemType: "movie", // assuming only movies for now
                                        });
                                        await utils.invalidate();

                                        toast.success("Movie removed from watchlist.");
                                    } catch (err) {
                                        setOptimisticInWatchlist(true); // Revert on error
                                        toast.error(
                                            "Failed to remove movie: " + (err as Error).message,
                                        );
                                    }
                                })();
                            }}
                        >
                            <span className="text-2xl font-extrabold">-</span>
                        </button>
                    </div>
                )}
                {/* Add button for movies not in watchlist */}
                {!optimisticInWatchlist && (
                    <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <button
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--ctp-lavender)] bg-[var(--ctp-base)] text-2xl font-extrabold text-[var(--ctp-lavender)] shadow-md hover:scale-110 hover:bg-[var(--ctp-lavender)] hover:text-white hover:shadow-lg focus:ring-2 focus:ring-[var(--ctp-lavender)] focus:outline-none"
                            disabled={!canEdit || addMovie.isPending}
                            aria-label="Add to Watchlist"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOptimisticInWatchlist(true); // Optimistic update
                                void (async () => {
                                    try {
                                        await addMovie.mutateAsync({
                                            tmdbId: tmdbId,
                                            itemType: "movie",
                                        });
                                        await utils.invalidate();
                                        toast.success(`${title} added to watchlist.`);
                                    } catch (err) {
                                        setOptimisticInWatchlist(false); // Revert on error
                                        toast.error(
                                            `Failed to add ${title}: ` + (err as Error).message,
                                        );
                                    }
                                })();
                            }}
                        >
                            <span className="text-xl font-bold">+</span>
                        </button>
                    </div>
                )}
            </div>
            <MovieModal
                open={open}
                onClose={() => setOpen(false)}
                movieId={tmdbId}
                inWatchlist={optimisticInWatchlist}
                canEdit={!!canEdit}
                onAddToWatchlist={() => {
                    setOptimisticInWatchlist(true);
                    void (async () => {
                        try {
                            await addMovie.mutateAsync({ tmdbId, itemType: "movie" });
                            await utils.invalidate();
                            toast.success(`${title} added to watchlist.`);
                        } catch (err) {
                            setOptimisticInWatchlist(false);
                            toast.error("Failed to add movie: " + (err as Error).message);
                        }
                    })();
                }}
                onRemoveFromWatchlist={() => {
                    setOptimisticInWatchlist(false);
                    void (async () => {
                        try {
                            await removeMovie.mutateAsync({ tmdbId, itemType: "movie" });
                            await utils.invalidate();
                            toast.success("Movie removed from watchlist.");
                        } catch (err) {
                            setOptimisticInWatchlist(true);
                            toast.error(
                                `Failed to add ${title}: ` + (err as Error).message,
                            );
                        }
                    })();
                }}
                isPending={addMovie.isPending || removeMovie.isPending}
                useModalNavigation={useModalNavigation}
            />
        </>
    );
}
