"use client";
import WatchlistDetails from "./WatchlistDetails";
import { api } from "../../trpc/react";

export default function WatchlistPageClient({
  currentUserId,
}: {
  currentUserId: number;
}) {
  const {
    data: watchlist,
    isLoading,
    error,
  } = api.watchlist.getMyWatchlistForUser.useQuery(currentUserId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading watchlist.</div>;
  if (!watchlist) return <div>No watchlist found.</div>;

  return (
    <WatchlistDetails
      id={watchlist.id}
      name={watchlist.name}
      items={watchlist.items}
      memberships={watchlist.memberships}
      currentUserId={currentUserId}
    />
  );
}
