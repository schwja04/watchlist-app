import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieExternalIds,
  getTrendingMovies,
  getTopRatedMovies,
  getMoviesByGenre,
} from "~/server/externalServices/tmdb";

export const movieRouter = createTRPCRouter({
  tmdbMovie: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const movieId = input.id;
      const [details, credits, externalIds] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
        getMovieExternalIds(movieId),
      ]);
      return { details, credits, externalIds };
    }),
  getTrendingMovies: publicProcedure
    .input(
      z.object({
        period: z.enum(["day", "week"]),
        page: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await getTrendingMovies(input.period, input.page ?? 1);
    }),
  getTopRatedMovies: publicProcedure
    .input(z.object({ page: z.number().optional() }))
    .query(async ({ input }) => {
      return await getTopRatedMovies(input.page ?? 1);
    }),
  getMoviesByGenre: publicProcedure
    .input(z.object({ genreId: z.number(), page: z.number().optional() }))
    .query(async ({ input }) => {
      return await getMoviesByGenre(input.genreId, input.page ?? 1);
    }),
});
