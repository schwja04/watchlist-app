import { currentUser } from "@clerk/nextjs/server";
import HomePageClient from "./HomePageClient";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return <div>Please sign in to view this page.</div>;
  }
  return <HomePageClient currentUserId={user.privateMetadata.internalUserId} />;
}
