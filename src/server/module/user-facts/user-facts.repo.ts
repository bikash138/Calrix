import { and, asc, eq, ilike, sql } from "drizzle-orm";
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
  createdAt: string; // ISO — used to order the rendered block
};

export type AddFactResult =
  | { ok: true; id: string; createdAt: string; deduped: boolean }
  | { ok: false; reason: "empty" | "capped" };

export const userFactsRepo = {
  /** All facts for a user, oldest first (stable ordering for the block). */
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

  /**
   * Insert a fact. Skips near-duplicates (same category + identical content,
   * case-insensitive) and enforces the per-user cap. Returns enough for the
   * caller to update the cache without a second query.
   */
  async add(
    userId: string,
    input: { category: FactCategory; content: string },
  ): Promise<AddFactResult> {
    const content = input.content.trim();
    if (!content) return { ok: false, reason: "empty" };

    const [dupe] = await db
      .select({ id: userFacts.id, createdAt: userFacts.createdAt })
      .from(userFacts)
      .where(
        and(
          eq(userFacts.userId, userId),
          eq(userFacts.category, input.category),
          ilike(userFacts.content, content),
        ),
      )
      .limit(1);
    if (dupe)
      return {
        ok: true,
        id: dupe.id,
        createdAt: dupe.createdAt.toISOString(),
        deduped: true,
      };

    const [{ value: total }] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(userFacts)
      .where(eq(userFacts.userId, userId));
    if (total >= MAX_FACTS_PER_USER) return { ok: false, reason: "capped" };

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

  /** Remove by short-id prefix (the 8-char handle shown in the prompt block). */
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
