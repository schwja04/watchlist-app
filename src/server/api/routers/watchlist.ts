import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  getMyWatchlistForUser,
} from "~/server/db/watchlistProcedures";

export const watchlistRouter = createTRPCRouter({
  getMyWatchlistForUser: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const watchlist = await getMyWatchlistForUser(input);
      if (!watchlist) return null;
      const { getMovieDetails } = await import(
        "~/server/externalServices/tmdb/tmdbClient"
      );
      const enrichedItems = await Promise.all(
        watchlist.items.map(async (item) => {
          const tmdbDetails = await getMovieDetails(item.tmdb_id);
          return {
            ...item,
            posterUrl: tmdbDetails?.poster_path
              ? `https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}`
              : null,
            title: tmdbDetails?.title ?? null,
            overview: tmdbDetails?.overview ?? null,
          };
        }),
      );
      return {
        ...watchlist,
        items: enrichedItems,
      };
    }),
  addMovie: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        itemType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await currentUser();

      return await addMovieToWatchlist({
        itemType: input.itemType,
        tmdbId: input.tmdbId,
        watchlistId: user!.publicMetadata.defaultWatchlistId,
        addedByUserId: user!.privateMetadata.internalUserId,
      });
    }),
  removeMovie: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        itemType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await currentUser();

      return await removeMovieFromWatchlist(
        Object.assign(input, {
          removedByUserId: user!.privateMetadata.internalUserId,
          watchlistId: user!.publicMetadata.defaultWatchlistId,
        }),
      );
    }),
});
