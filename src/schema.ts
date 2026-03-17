import { sql } from "drizzle-orm";
import { integer, pgPolicy, pgRole, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

// --- Roles (managed by drizzle-kit when entities.roles is enabled) ---
export const votechainAnon = pgRole("votechain_anon", { createRole: true, inherit: true });
export const votechainUser = pgRole("votechain_user", { createRole: true, inherit: true });
export const votechainService = pgRole("votechain_service", { createRole: true, inherit: true });

// Application session variable used by RLS policies.
// The API layer should set this per-request inside a transaction:
//   select set_config('app.user_address', '<0x...>', true);
const appUserAddress = sql`nullif(current_setting('app.user_address', true), '')`;

export const topics = pgTable(
  "topics",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    status: text("status").notNull(), // draft | active | ended | archived
    creator: text("creator").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Anyone can read topics (public catalog).
    pgPolicy("topics_select_public", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // Only the service role can insert/update/delete topics.
    pgPolicy("topics_write_service", {
      for: "all",
      to: votechainService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
    // Topic creator (from app.user_address) can update their own topic (optional UX).
    pgPolicy("topics_update_creator", {
      for: "update",
      to: votechainUser,
      using: sql`${t.creator} = ${appUserAddress}`,
      withCheck: sql`${t.creator} = ${appUserAddress}`,
    }),
  ],
);

export const topicComments = pgTable(
  "topic_comments",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
  },
  (t) => [
    // Public can read comments.
    pgPolicy("comments_select_public", { for: "select", to: "public", using: sql`true` }),
    // Signed-in users can insert comments, but only as themselves.
    pgPolicy("comments_insert_self", {
      for: "insert",
      to: votechainUser,
      withCheck: sql`${t.author} = ${appUserAddress}`,
    }),
    // Service role can manage comments (moderation, backfills).
    pgPolicy("comments_write_service", {
      for: "all",
      to: votechainService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

export const topicAllowlist = pgTable(
  "topic_allowlist",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    voter: text("voter").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.topicId, t.voter] }),
    // Allowlist is sensitive: only service can read/write.
    pgPolicy("allowlist_service_only", {
      for: "all",
      to: votechainService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

// Append-only vote event log (event-sourcing)
export const voteEvents = pgTable(
  "vote_events",
  {
    id: serial("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    voter: text("voter").notNull(),
    type: text("type").notNull(), // up | down
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    receiptId: text("receipt_id").notNull(),
  },
  (t) => [
    // Voters can see their own votes (privacy), service can see all.
    pgPolicy("votes_select_self", {
      for: "select",
      to: votechainUser,
      using: sql`${t.voter} = ${appUserAddress}`,
    }),
    pgPolicy("votes_service_all", {
      for: "all",
      to: votechainService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
    // Users can insert only their own vote event.
    pgPolicy("votes_insert_self", {
      for: "insert",
      to: votechainUser,
      withCheck: sql`${t.voter} = ${appUserAddress}`,
    }),
  ],
);

// Snapshot roots for auditors (tracks last event included)
export const voteSnapshots = pgTable(
  "vote_snapshots",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" })
      .primaryKey(),
    lastEventId: integer("last_event_id").notNull().default(0),
    root: text("root").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    // Snapshot roots are safe to publish for auditing.
    pgPolicy("snapshots_select_public", { for: "select", to: "public", using: sql`true` }),
    pgPolicy("snapshots_write_service", {
      for: "all",
      to: votechainService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);
