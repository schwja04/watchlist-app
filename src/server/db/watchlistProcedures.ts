import { db } from ".";
import {
    outboxEvents,
    watchlists,
    watchlistMemberships,
    users,
    watchlistItems,
} from "./schema";
import { and, eq } from "drizzle-orm";

export async function createWatchlistForUser(internalUserId: number) {
    // Check if the user is already the owner of a watchlist
    // If so, return the existing watchlist ID
    const [existingWatchlist] = await db
        .select({
            id: watchlists.id,
        })
        .from(watchlists)
        .innerJoin(
            watchlistMemberships,
            eq(watchlistMemberships.watchlist_id, watchlists.id),
        )
        .where(
            and(
                eq(watchlistMemberships.user_id, internalUserId),
                eq(watchlistMemberships.role, "owner"),
            ),
        );

    if (existingWatchlist) {
        return existingWatchlist.id;
    }

    const [watchlist] = await db
        .insert(watchlists)
        .values({
            name: "My Watchlist",
        })
        .returning({ id: watchlists.id });

    await db.insert(watchlistMemberships).values({
        watchlist_id: watchlist!.id,
        user_id: internalUserId,
        role: "owner",
    });

    return watchlist!.id;
}

export async function getMyWatchlistForUser(internalUserId: number) {
    const [watchlist] = await db
        .select({
            id: watchlists.id,
            name: watchlists.name,
        })
        .from(watchlists)
        .innerJoin(
            watchlistMemberships,
            eq(watchlistMemberships.watchlist_id, watchlists.id),
        )
        .where(
            and(
                eq(watchlistMemberships.user_id, internalUserId),
                eq(watchlistMemberships.role, "owner"),
            ),
        );

    if (!watchlist) {
        console.error(`No watchlist found for user ID ${internalUserId}.`);
        return null;
    }

    // Memberships
    const memberships = await db
        .select({
            role: watchlistMemberships.role,
            user: {
                id: users.id,
                username: users.username,
                oauth_provider: users.oauth_provider,
                external_id: users.external_id,
            },
        })
        .from(watchlistMemberships)
        .innerJoin(users, eq(users.id, watchlistMemberships.user_id))
        .where(eq(watchlistMemberships.watchlist_id, watchlist.id));

    // Items
    const items = await db
        .select({
            id: watchlistItems.id,
            tmdb_id: watchlistItems.tmdb_id,
            item_type: watchlistItems.item_type,
            added_by_user_id: watchlistItems.added_by_user_id,
        })
        .from(watchlistItems)
        .where(eq(watchlistItems.watchlist_id, watchlist.id));

    return {
        id: watchlist.id,
        name: watchlist.name,
        memberships,
        items,
    };
}

export async function getWatchlistItems(watchlistId: number) {
    const items = await db
        .select({
            id: watchlistItems.id,
            tmdb_id: watchlistItems.tmdb_id,
            item_type: watchlistItems.item_type,
            added_by_user_id: watchlistItems.added_by_user_id,
        })
        .from(watchlistItems)
        .where(eq(watchlistItems.watchlist_id, watchlistId));

    return items;
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function writeOutboxEvent(
    eventType: string,
    payload: JsonValue,
    tx: Transaction,
) {
    await tx.insert(outboxEvents).values({
        event_type: eventType,
        payload: payload,
    });
}

async function userCanEditWatchlist(
    watchlistId: number,
    userId: number,
): Promise<boolean> {
    const [membership] = await db
        .select({ role: watchlistMemberships.role })
        .from(watchlistMemberships)
        .where(
            and(
                eq(watchlistMemberships.watchlist_id, watchlistId),
                eq(watchlistMemberships.user_id, userId),
            ),
        );
    return (
        !!membership &&
        (membership.role === "owner" || membership.role === "editor")
    );
}

export async function addMovieToWatchlist({
    watchlistId,
    tmdbId,
    itemType,
    addedByUserId,
}: {
    watchlistId: number;
    tmdbId: number;
    itemType: string;
    addedByUserId: number;
}) {
    return await db.transaction(async (tx) => {
        // Permission check
        const canEdit = await userCanEditWatchlist(watchlistId, addedByUserId);
        if (!canEdit) {
            throw new Error("User does not have permission to add to this watchlist");
        }
        // Check for duplicate
        const [existing] = await tx
            .select({ id: watchlistItems.id })
            .from(watchlistItems)
            .where(
                and(
                    eq(watchlistItems.watchlist_id, watchlistId),
                    eq(watchlistItems.tmdb_id, tmdbId),
                    eq(watchlistItems.item_type, itemType),
                ),
            );
        if (existing) {
            throw new Error("Movie already in watchlist");
        }
        // Insert item
        const inserted = await tx
            .insert(watchlistItems)
            .values({
                watchlist_id: watchlistId,
                tmdb_id: tmdbId,
                item_type: itemType,
                added_by_user_id: addedByUserId,
            })
            .returning({ id: watchlistItems.id });
        const itemId = inserted[0]!.id;
        // Write outbox event
        await writeOutboxEvent(
            "watchlist.item.added",
            {
                watchlistId,
                itemId: itemId,
                tmdbId,
                itemType,
                addedByUserId,
            },
            tx,
        );
        return itemId;
    });
}

export async function removeMovieFromWatchlist({
    watchlistId,
    tmdbId,
    itemType,
    removedByUserId,
}: {
    watchlistId: number;
    tmdbId: number;
    itemType: string;
    removedByUserId: number;
}) {
    return await db.transaction(async (tx) => {
        // Permission check
        const canEdit = await userCanEditWatchlist(watchlistId, removedByUserId);
        if (!canEdit) {
            throw new Error(
                "User does not have permission to remove from this watchlist",
            );
        }
        // Find the item
        const [item] = await tx
            .select({ id: watchlistItems.id })
            .from(watchlistItems)
            .where(
                and(
                    eq(watchlistItems.watchlist_id, watchlistId),
                    eq(watchlistItems.tmdb_id, tmdbId),
                    eq(watchlistItems.item_type, itemType),
                ),
            );
        if (!item) {
            throw new Error("Movie not found in watchlist");
        }
        // Remove item
        await tx.delete(watchlistItems).where(eq(watchlistItems.id, item.id));
        // Write outbox event
        await writeOutboxEvent(
            "watchlist.item.removed",
            {
                watchlistId,
                itemId: item.id,
                tmdbId,
                itemType,
                removedByUserId,
            },
            tx,
        );
        return item.id;
    });
}

// Type for JSON-serializable values
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
    | JsonPrimitive
    | JsonValue[]
    | { [key: string]: JsonValue };

