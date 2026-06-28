import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  userFacts,
  FactCategory,
  FactSource,
  MAX_FACTS_PER_USER,
} from "@/server/db/schema/user-facts";

export type UserFact = {
  id: string;
  category: FactCategory;
  content: string;
  createdAt: string;
};

export type AddFactResult =
  | { ok: true; id: string; createdAt: string; deduped: boolean }
  | { ok: false; reason: "empty" | "capped" };

export const userFactsRepo = {
  async listForUser(userId: string): Promise<UserFact[]> {
    const rows = await db
      .select({
        id: userFacts.id,
        category: userFacts.category,
        content: userFacts.content,
        createdAt: userFacts.createdAt,
      })
      .from(userFacts)
      .where(eq(userFacts.userId, userId))
      .orderBy(asc(userFacts.createdAt));

    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  },

  async add(
    userId: string,
    input: { category: FactCategory; content: string },
  ): Promise<AddFactResult> {
    const content = input.content.trim();
    if (!content) return { ok: false, reason: "empty" };

    const { rows: [check] } = await db.execute<{
      dupe_id: string | null;
      dupe_created_at: Date | null;
      total: number;
    }>(sql`
      SELECT
        (SELECT id FROM user_facts WHERE user_id = ${userId} AND category = ${input.category} AND content ILIKE ${content} LIMIT 1) AS dupe_id,
        (SELECT created_at FROM user_facts WHERE user_id = ${userId} AND category = ${input.category} AND content ILIKE ${content} LIMIT 1) AS dupe_created_at,
        (SELECT count(*)::int FROM user_facts WHERE user_id = ${userId}) AS total
    `);

    if (check.dupe_id)
      return {
        ok: true,
        id: check.dupe_id,
        createdAt: (check.dupe_created_at as Date).toISOString(),
        deduped: true,
      };

    if (check.total >= MAX_FACTS_PER_USER) return { ok: false, reason: "capped" };

    const [row] = await db
      .insert(userFacts)
      .values({
        userId,
        category: input.category,
        content,
        source: FactSource.USER_STATED,
      })
      .returning({ id: userFacts.id, createdAt: userFacts.createdAt });

    return {
      ok: true,
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      deduped: false,
    };
  },

  async remove(userId: string, shortId: string): Promise<boolean> {
    const id = shortId.trim();
    if (!id) return false;

    const deleted = await db
      .delete(userFacts)
      .where(
        and(eq(userFacts.userId, userId), sql`${userFacts.id} LIKE ${id + "%"}`),
      )
      .returning({ id: userFacts.id });

    return deleted.length > 0;
  },
};
