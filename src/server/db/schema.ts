// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `watchlist-app_${name}`);

// export const posts = createTable(
//   "post",
//   (d) => ({
//     id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
//     name: d.varchar({ length: 256 }),
//     createdAt: d
//       .timestamp({ withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
//   }),
//   (t) => [index("name_idx").on(t.name)],
// );
//

export const users = createTable(
    "user",
    (d) => ({
        id: d.serial().primaryKey(),
        username: d.varchar({ length: 50 }).notNull(),
        oauth_provider: d.varchar({ length: 50 }).notNull(), // e.g., "clerk"
        external_id: d.varchar({ length: 100 }).notNull(), // e.g., OAuth provider ID
        created_at: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updated_at: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
    (t) => [
        uniqueIndex("user_username_idx").on(t.username),
        uniqueIndex("user_external_id_idx").on(t.oauth_provider, t.external_id),
    ],
);

export const watchlists = createTable(
    "watchlist",
    (d) => ({
        id: d.serial().primaryKey(),
        name: d.varchar({ length: 256 }).notNull(),
        created_at: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updated_at: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
);

export const watchlistMemberships = createTable(
    "watchlist_membership",
    (d) => ({
        id: d.serial().primaryKey(),
        watchlist_id: d.integer().notNull().references(() => watchlists.id),
        user_id: d.integer().notNull().references(() => users.id),
        role: d.varchar({ length: 25 }).notNull().default("owner"), // owner, editor, viewer
        created_at: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updated_at: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
    (t) => [
        index("membership_watchlist_idx").on(t.watchlist_id),
        index("membership_user_idx").on(t.user_id),
        // A unique index that prevents a user from having multiple roles in the same watchlist
        uniqueIndex("membership_watchlist_user_idx").on(t.watchlist_id, t.user_id),
        // A constraint to ensure a user can only be an owner of one watchlist
        uniqueIndex("membership_owner_unique_idx")
            .on(t.user_id)
            .where(sql`${t.role} = 'owner'`),
    ],
);

export const watchlistItems = createTable(
    "watchlist_item",
    (d) => ({
        id: d.serial().primaryKey(),
        watchlist_id: d.integer().notNull().references(() => watchlists.id),
        item_type: d.varchar({ length: 50 }).notNull(), // e.g., "movie", "tv_show"
        tmdb_id: d.integer().notNull(),
        added_by_user_id: d.integer().notNull().references(() => users.id),
        created_at: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updated_at: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
);

