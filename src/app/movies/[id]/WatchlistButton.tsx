"use client";
import { api } from "~/trpc/react";
import React, { useState, useEffect } from "react";

export default function WatchlistButton({
    tmdbId,
    currentUserId,
}: {
    tmdbId: number;
    currentUserId: number;
}) {
    const utils = api.useUtils();
    const { data: watchlist } =
        api.watchlist.getMyWatchlistForUser.useQuery(currentUserId);
    const canEdit = watchlist?.memberships?.some(
        (m: { user: { id: number }; role: string }) =>
            m.user.id === currentUserId &&
            (m.role === "owner" || m.role === "editor"),
    );
    const isInWatchlist = watchlist?.items?.some(
        (item: { tmdb_id: number }) => item.tmdb_id === tmdbId,
    );
    const [optimisticInWatchlist, setOptimisticInWatchlist] =
        useState<boolean>(!!isInWatchlist);
    useEffect(() => {
        setOptimisticInWatchlist(!!isInWatchlist);
    }, [isInWatchlist]);

    const addMovie = api.watchlist.addMovie.useMutation({
        onSuccess: async () => {
            await utils.watchlist.getMyWatchlistForUser.invalidate();
        },
    });
    const removeMovie = api.watchlist.removeMovie.useMutation({
        onSuccess: async () => {
            await utils.watchlist.getMyWatchlistForUser.invalidate();
        },
    });

    if (!canEdit) return null;

    return optimisticInWatchlist ? (
        <button
            className="ml-4 rounded border-2 border-[var(--ctp-red)] bg-[var(--ctp-base)] px-3 py-1 text-base font-bold text-[var(--ctp-red)] shadow hover:bg-[var(--ctp-red)] hover:text-white focus:ring-2 focus:ring-[var(--ctp-red)] focus:outline-none disabled:opacity-50"
            onClick={() => {
                setOptimisticInWatchlist(false);
                removeMovie.mutate({ tmdbId, itemType: "movie" });
            }}
            disabled={removeMovie.isPending}
            aria-label="Remove from Watchlist"
        >
            Remove from Watchlist
        </button>
    ) : (
        <button
            className="ml-4 rounded border-2 border-[var(--ctp-lavender)] bg-[var(--ctp-base)] px-3 py-1 text-base font-bold text-[var(--ctp-lavender)] shadow hover:bg-[var(--ctp-lavender)] hover:text-white focus:ring-2 focus:ring-[var(--ctp-lavender)] focus:outline-none disabled:opacity-50"
            onClick={() => {
                setOptimisticInWatchlist(true);
                addMovie.mutate({ tmdbId, itemType: "movie" });
            }}
            disabled={addMovie.isPending}
            aria-label="Add to Watchlist"
        >
            Add to Watchlist
        </button>
    );
}
