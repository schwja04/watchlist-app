import { currentUser } from "@clerk/nextjs/server";
import WatchlistPageClient from "./WatchlistPageClient";

export default async function WatchlistPage() {
  const user = await currentUser();
  if (!user) return <div>Please sign in to view your watchlist.</div>;
  return (
    <WatchlistPageClient currentUserId={user.privateMetadata.internalUserId} />
  );
}
