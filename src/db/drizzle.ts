import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let _pool: Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

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