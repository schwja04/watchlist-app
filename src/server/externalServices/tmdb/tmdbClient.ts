import { env } from "~/env";
import type {
  TMDbCredits,
  TMDbExternalIds,
  TMDbMovieDetails,
  TMDbMovieListResponse,
} from "./tmdb.types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetcher(
  endpoint: string,
  params: Record<string, string | number> = {},
): Promise<Response> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${env.TMDB_API_READ_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return res;
}

async function responseToObjectOrThrowError<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`TMDb API error: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

async function responseToObjectOrNull<T>(res: Response): Promise<T | null> {
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as T;
}

export async function getTrendingMovies(
  period: "day" | "week",
  page = 1,
): Promise<TMDbMovieListResponse> {
  const response = await fetcher(`/trending/movie/${period}`, { page });

  return await responseToObjectOrThrowError<TMDbMovieListResponse>(response);
}

export async function getPopularMovies(
  page = 1,
): Promise<TMDbMovieListResponse> {
  const response = await fetcher("/movie/popular", { page });

  return await responseToObjectOrThrowError<TMDbMovieListResponse>(response);
}

export async function getTopRatedMovies(
  page = 1,
): Promise<TMDbMovieListResponse> {
  const response = await fetcher("/movie/top_rated", { page });

  return await responseToObjectOrThrowError<TMDbMovieListResponse>(response);
}

export async function getMoviesByGenre(
  genreId: number,
  page = 1,
): Promise<TMDbMovieListResponse> {
  const response = await fetcher("/discover/movie", {
    with_genres: genreId,
    page,
  });

  return await responseToObjectOrThrowError<TMDbMovieListResponse>(response);
}

export async function getMovieDetails(
  movieId: number,
): Promise<TMDbMovieDetails | null> {
  const response = await fetcher(`/movie/${movieId}`);

  return await responseToObjectOrNull<TMDbMovieDetails>(response);
}

export async function getMovieCredits(movieId: number): Promise<TMDbCredits> {
  const response = await fetcher(`/movie/${movieId}/credits`);

  return await responseToObjectOrThrowError<TMDbCredits>(response);
}

export async function getMovieExternalIds(
  movieId: number,
): Promise<TMDbExternalIds> {
  const response = await fetcher(`/movie/${movieId}/external_ids`);

  return await responseToObjectOrThrowError<TMDbExternalIds>(response);
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<TMDbMovieListResponse> {
  const response = await fetcher("/search/movie", {
    query,
    page,
  });
  return await responseToObjectOrThrowError<TMDbMovieListResponse>(response);
}
