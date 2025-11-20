"use client";
import MovieCarousel from "./_components/MovieCarousel";
import { api } from "~/trpc/react";
import type { TMDbMovie } from "~/server/externalServices/tmdb/tmdb.types";

export default function HomePageClient({
  currentUserId,
}: {
  currentUserId: number;
}) {
  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
  } = api.watchlist.getMyWatchlistForUser.useQuery(currentUserId);
  const {
    data: trendingRes,
    isLoading: isTrendingLoading,
    error: trendingError,
  } = api.movie.getTrendingMovies.useQuery({ period: "day", page: 1 });
  const {
    data: topRatedRes,
    isLoading: isTopRatedLoading,
    error: topRatedError,
  } = api.movie.getTopRatedMovies.useQuery({ page: 1 });
  const {
    data: comedyRes,
    isLoading: isComedyLoading,
    error: comedyError,
  } = api.movie.getMoviesByGenre.useQuery({ genreId: 35, page: 1 });

  if (
    isWatchlistLoading ||
    isTrendingLoading ||
    isTopRatedLoading ||
    isComedyLoading
  )
    return <div>Loading...</div>;
  if (watchlistError || trendingError || topRatedError || comedyError)
    return <div>Error loading data.</div>;
  if (!watchlist) return <div>No watchlist found.</div>;

  const canEditWatchlist = watchlist.memberships.some(
    (membership: { user: { id: number }; role: string }) =>
      membership.user.id === currentUserId &&
      (membership.role === "owner" || membership.role === "editor"),
  );

  const mapToMovieCard = (movie: TMDbMovie) => ({
    tmdbId: movie.id,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "",
    title: movie.title,
    overview: movie.overview,
    watchlistId: watchlist.items.find(
      (item: { tmdb_id: number }) => item.tmdb_id === movie.id,
    )
      ? watchlist.id
      : undefined,
    canEdit: canEditWatchlist,
  });

  const trendingMovies = trendingRes?.results?.map(mapToMovieCard) ?? [];
  const topRatedMovies = topRatedRes?.results?.map(mapToMovieCard) ?? [];
  const comedyMovies = comedyRes?.results?.map(mapToMovieCard) ?? [];

  return (
    <>
      <MovieCarousel title="Trending" movies={trendingMovies} />
      <MovieCarousel title="Top Rated" movies={topRatedMovies} />
      <MovieCarousel title="Comedy" movies={comedyMovies} />
      {/* Other page content below carousel */}
    </>
  );
}
