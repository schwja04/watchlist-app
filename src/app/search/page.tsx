import { currentUser } from "@clerk/nextjs/server";
import SearchPageClient from "./SearchPageClient";

export default async function SearchPage() {
  const user = await currentUser();
  if (!user) {
    return <div>Please sign in to view this page.</div>;
  }
  return (
    <SearchPageClient currentUserId={user.privateMetadata.internalUserId} />
  );
}
