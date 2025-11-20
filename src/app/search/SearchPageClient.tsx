"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { TMDbMovie } from "~/server/externalServices/tmdb/tmdb.types";
import MovieCard from "../_components/MovieCard";

import { api } from "~/trpc/react";

export default function SearchPageClient({
  currentUserId,
}: {
  currentUserId: number;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [results, setResults] = useState<TMDbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
  } = api.watchlist.getMyWatchlistForUser.useQuery(currentUserId);
  const canEditWatchlist = watchlist?.memberships.some(
    (membership) =>
      membership.user.id === currentUserId &&
      (membership.role === "owner" || membership.role === "editor"),
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then((res) => res.json() as Promise<{ results: TMDbMovie[] }>)
      .then((data) => {
        setResults(data.results ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch search results.");
        setLoading(false);
      });
  }, [query]);

  if (isWatchlistLoading) {
    return (
      <main className="min-h-screen w-full bg-[var(--ctp-base)]">
        <div className="pt-20 text-center text-lg text-[var(--ctp-lavender)]">
          Loading watchlist...
        </div>
      </main>
    );
  }
  if (watchlistError) {
    return (
      <main className="min-h-screen w-full bg-[var(--ctp-base)]">
        <div className="pt-20 text-center text-lg text-[var(--ctp-red)]">
          Error loading watchlist.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[var(--ctp-base)]">
      <h1 className="mb-4 ml-6 pt-8 text-3xl font-extrabold text-[var(--ctp-lavender)] drop-shadow">
        Results{query ? ` for "${query}"` : ""}
      </h1>
      <div className="w-full">
        <div className="mt-4 text-white">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && results.length === 0 && query.trim() && (
            <div>No results found for &quot;{query}&quot;.</div>
          )}
          <div className="flex w-full flex-wrap gap-6 px-4">
            {results.map((movie) => {
              const isInWatchlist = watchlist?.items?.find(
                (item) => item.tmdb_id === movie.id,
              );
              return (
                <div className="h-90" key={movie.id}>
                  <MovieCard
                    tmdbId={movie.id}
                    posterUrl={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : ""
                    }
                    title={movie.title}
                    className="h-full"
                    useModalNavigation={false}
                    watchlistId={isInWatchlist ? watchlist?.id : undefined}
                    canEdit={!!canEditWatchlist}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
