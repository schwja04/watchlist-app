import { db } from ".";
import { users } from "./schema";

export async function saveClerkUserMetadata(
    clerkUserId: string,
    username: string) {

    await db.insert(users).values({
        oauth_provider: "clerk",
        external_id: clerkUserId,
        username: username,
    }).onConflictDoNothing();

    // fetch the inserted user id as we can't guarentee the user was inserted
    const user = await db.query.users.findFirst({
        where: (users, { eq, and }) => and(eq(users.oauth_provider, "clerk"), eq(users.external_id, clerkUserId)),
    });

    return user!.id;
}
