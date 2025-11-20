import { NextResponse } from "next/server";
import { saveClerkUserMetadata } from "~/server/db/userProcedures";
import { createWatchlistForUser } from "~/server/db/watchlistProcedures";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs"; // Ensure Node.js runtime for DB access

export async function POST() {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated || !userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    // Save some user data to the database
    const username = user?.username ?? `user_${userId}`;
    const internalUserId = await saveClerkUserMetadata(userId, username);

    // Create a watchlist for the user
    const watchlistId = await createWatchlistForUser(internalUserId);

    // Update the session claim to indicate onboarding is complete
    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            onboardingComplete: true,
            defaultWatchlistId: watchlistId,
        },
        privateMetadata: {
            internalUserId: internalUserId,
        },
    });

    return NextResponse.json({ success: true });
}
