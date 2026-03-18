import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";

let _pool: Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

export type VotechainRlsRole = "votechain_anon" | "votechain_user" | "votechain_service";

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getPool());
  }
  return _db;
}

export async function withRls<T>(
  ctx: { role: VotechainRlsRole; userAddress?: string },
  fn: (tx: unknown) => Promise<T>,
) {
  const db = getDb();
  return db.transaction(async (tx: unknown) => {
    const rlsTx = tx as { execute: (q: unknown) => Promise<unknown> };
    await rlsTx.execute(sql`select set_config('app.user_address', ${ctx.userAddress ?? ""}, true);`);
    await rlsTx.execute(sql.raw(`set local role ${ctx.role};`));
    try {
      return await fn(tx);
    } finally {
      await rlsTx.execute(sql`select set_config('app.user_address', '', true);`);
      await rlsTx.execute(sql`reset role;`);
    }
  });
}