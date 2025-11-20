"use client";
import MovieCard from "../_components/MovieCard";

export default function WatchlistDetails(watchlist: {
  id: number;
  name: string;
  items: {
    id: number;
    tmdb_id: number;
    item_type: string;
    posterUrl?: string | null;
    title?: string | null;
  }[];
  memberships: {
    role: string;
    user: { id: number };
  }[];
  currentUserId?: number;
}) {
  return (
    <div className="">
      <h1 className="mb-4 ml-6 pt-8 text-3xl font-extrabold text-[var(--ctp-lavender)] drop-shadow">
        My Watchlist
      </h1>
      {watchlist.items.length === 0 ? (
        <div className="text-center text-lg text-gray-400">
          Your watchlist is empty.
        </div>
      ) : (
        <div className="flex w-full flex-wrap gap-6 px-4">
          {watchlist.items.map((movie) => (
            <div className="h-90" key={movie.id}>
              <MovieCard
                key={movie.tmdb_id}
                tmdbId={movie.tmdb_id}
                posterUrl={movie.posterUrl ?? ""}
                title={movie.title ?? "Untitled"}
                watchlistId={watchlist.id}
                canEdit={Boolean(
                  watchlist.memberships?.some(
                    (m) =>
                      m.user.id === watchlist.currentUserId &&
                      (m.role === "owner" || m.role === "editor"),
                  ),
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
