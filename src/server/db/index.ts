import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle>;
  conn: Pool;
};

export const conn =
  globalForDb.conn ?? new Pool({ connectionString: env.DATABASE_URL });
export const db = globalForDb.db ?? drizzle(conn);

if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  globalForDb.db = db;
}
