import crypto from "crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { withRls } from "@/db/drizzle";
import { topicAllowlist, topicComments, topics, voteEvents, voteSnapshots } from "@/schema";

export type VoteEventType = "up" | "down";

function sha256Hex(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function normalizeVoter(v: string) {
  return v.toLowerCase();
}

export async function listTopics() {
  return withRls({ role: "votechain_anon" }, (tx) =>
    tx.select().from(topics).orderBy(sql`${topics.createdAt} desc`),
  );
}

export async function getTopic(topicId: string) {
  const [t] = await withRls({ role: "votechain_anon" }, (tx) =>
    tx.select().from(topics).where(eq(topics.id, topicId)).limit(1),
  );
  return t ?? null;
}

export async function createTopic(input: typeof topics.$inferInsert) {
  const [row] = await withRls({ role: "votechain_service" }, (tx) =>
    tx.insert(topics).values(input).returning(),
  );
  return row;
}

export async function addTopicComment(input: typeof topicComments.$inferInsert) {
  const role = input.author ? "votechain_user" : "votechain_service";
  const [row] = await withRls(
    { role, userAddress: input.author ?? undefined },
    (tx) => tx.insert(topicComments).values(input).returning(),
  );
  return row;
}

export async function addAllowlist(topicId: string, voters: string[]) {
  const rows = voters.map((v) => ({
    topicId,
    voter: normalizeVoter(v),
  }));
  if (rows.length === 0) return { added: 0 };
  // If duplicates exist, Postgres will ignore via ON CONFLICT DO NOTHING.
  const res = await withRls({ role: "votechain_service" }, (tx) =>
    tx
      .insert(topicAllowlist)
      .values(rows)
      .onConflictDoNothing()
      .returning({ voter: topicAllowlist.voter }),
  );
  return { added: res.length };
}

export async function getAllowlist(topicId: string) {
  const rows = await withRls({ role: "votechain_service" }, (tx) =>
    tx
      .select({ voter: topicAllowlist.voter })
      .from(topicAllowlist)
      .where(eq(topicAllowlist.topicId, topicId)),
  );
  return rows.map((r) => r.voter);
}

export async function isEligibleDb(topicId: string, voter: string) {
  // NOTE: allowlist is service-only under RLS. Eligibility checks must run as service.
  const allow = await getAllowlist(topicId);
  if (allow.length === 0) return true; // open vote when no allowlist entries
  return allow.includes(normalizeVoter(voter));
}

export async function hasVotedDb(topicId: string, voter: string) {
  const [hit] = await withRls({ role: "votechain_service" }, (tx) =>
    tx
      .select({ id: voteEvents.id })
      .from(voteEvents)
      .where(and(eq(voteEvents.topicId, topicId), eq(voteEvents.voter, normalizeVoter(voter))))
      .limit(1),
  );
  return Boolean(hit);
}

export function makeReceiptId(topicId: string, voter: string, type: VoteEventType, timestampIso: string) {
  return sha256Hex(`${topicId}|${normalizeVoter(voter)}|${type}|${timestampIso}`);
}

// Append-only event (source of truth). Topic counters can be derived or updated separately.
export async function appendVoteEvent(topicId: string, voter: string, type: VoteEventType) {
  const ts = new Date().toISOString();
  const receiptId = makeReceiptId(topicId, voter, type, ts);
  const [row] = await withRls({ role: "votechain_user", userAddress: voter }, (tx) =>
    tx
      .insert(voteEvents)
      .values({
        topicId,
        voter: normalizeVoter(voter),
        type,
        timestamp: new Date(ts),
        receiptId,
      })
      .returning(),
  );
  return { ...row, timestamp: ts };
}

// Snapshot root over vote event leaves for auditing.
// This is structured to support incremental updates (tracked by lastEventId).
export async function recomputeSnapshot(topicId: string) {
  return withRls({ role: "votechain_service" }, async (db) => {
    const [snap] = await db.select().from(voteSnapshots).where(eq(voteSnapshots.topicId, topicId)).limit(1);
    const last = snap?.lastEventId ?? 0;

    const newEvents = await db
      .select({ id: voteEvents.id, voter: voteEvents.voter, type: voteEvents.type, timestamp: voteEvents.timestamp })
      .from(voteEvents)
      .where(and(eq(voteEvents.topicId, topicId), gt(voteEvents.id, last)))
      .orderBy(voteEvents.id);

    // For now, we recompute from all events to keep the logic simple and deterministic.
    // (You still get an append-only log + persisted snapshot roots; optimizing to a true incremental
    // merkle accumulator is a follow-up.)
    const allEvents = await db
      .select({ voter: voteEvents.voter, type: voteEvents.type, timestamp: voteEvents.timestamp })
      .from(voteEvents)
      .where(eq(voteEvents.topicId, topicId));

  const leaves = allEvents
    .map((e) => {
      const ts = e.timestamp instanceof Date ? e.timestamp.toISOString() : String(e.timestamp);
      return sha256Hex(`${topicId}|${e.voter}|${e.type}|${ts}`);
    })
    .sort((a, b) => a.localeCompare(b));

  let level = leaves.slice();
  let root = "";
  if (level.length > 0) {
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        next.push(i + 1 < level.length ? sha256Hex(level[i] + level[i + 1]) : level[i]);
      }
      level = next;
    }
    root = level[0] ?? "";
  }

  const lastNewEvent = newEvents.length ? newEvents[newEvents.length - 1] : undefined;
  const maxId = lastNewEvent ? lastNewEvent.id : last;

    await db
      .insert(voteSnapshots)
      .values({ topicId, lastEventId: maxId, root, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: voteSnapshots.topicId,
        set: { lastEventId: maxId, root, updatedAt: new Date() },
      });

    return { root, leavesCount: leaves.length, lastEventId: maxId };
  });
}
