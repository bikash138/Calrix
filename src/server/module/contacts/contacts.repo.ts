import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { contacts, ContactSource } from "@/server/db/schema/contacts";
export type ContactInput = { name: string; email: string };
export type ContactMatch = { name: string; email: string };

export const contactsRepo = {
  /**
   * Upsert contacts on (userId, email). Bumps interactionCount and refreshes
   * lastSeenAt; keeps the existing name when the incoming one is empty, and
   * prefers the richer (longer) display name within the batch.
   */
  async upsertMany(
    userId: string,
    items: ContactInput[],
    source: ContactSource = ContactSource.GMAIL_HARVEST,
  ): Promise<void> {
    const byEmail = new Map<string, ContactInput>();
    for (const it of items) {
      const email = it.email.toLowerCase().trim();
      if (!email.includes("@")) continue;
      const name = (it.name ?? "").trim();
      const existing = byEmail.get(email);
      if (!existing || name.length > existing.name.length) {
        byEmail.set(email, { name, email });
      }
    }

    const rows = [...byEmail.values()].map((it) => ({
      userId,
      name: it.name,
      email: it.email,
      source,
    }));
    if (rows.length === 0) return;

    await db
      .insert(contacts)
      .values(rows)
      .onConflictDoUpdate({
        target: [contacts.userId, contacts.email],
        set: {
          name: sql`CASE WHEN excluded.name <> '' THEN excluded.name ELSE ${contacts.name} END`,
          interactionCount: sql`${contacts.interactionCount} + 1`,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        },
      });
  },

  /** Total contacts stored for a user (diagnostics / capacity checks). */
  async countForUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(contacts)
      .where(eq(contacts.userId, userId));
    return row?.value ?? 0;
  },

  /**
   * Fuzzy-find contacts by name or email. Substring (ILIKE) catches exact and
   * email-local-part matches ("Bikash" → "shawbikash283@gmail.com"); trigram
   * (`%`) adds typo tolerance ("Bikahs"). Ranked by best similarity, then
   * interaction count, then recency. Requires the pg_trgm extension.
   */
  async search(
    userId: string,
    query: string,
    limit = 5,
  ): Promise<ContactMatch[]> {
    const q = query.trim();
    if (!q) return [];
    const contains = `%${q}%`;

    try {
      return await db
        .select({ name: contacts.name, email: contacts.email })
        .from(contacts)
        .where(
          and(
            eq(contacts.userId, userId),
            sql`(
              ${contacts.name} ILIKE ${contains}
              OR ${contacts.email} ILIKE ${contains}
              OR ${contacts.name} % ${q}::text
            )`,
          ),
        )
        .orderBy(
          desc(
            sql`GREATEST(
              similarity(${contacts.name}, ${q}::text),
              word_similarity(${q}::text, ${contacts.name}),
              word_similarity(${q}::text, ${contacts.email})
            )`,
          ),
          desc(contacts.interactionCount),
          desc(contacts.lastSeenAt),
        )
        .limit(limit);
    } catch {
      // pg_trgm extension not installed — fall back to plain ILIKE
      return db
        .select({ name: contacts.name, email: contacts.email })
        .from(contacts)
        .where(
          and(
            eq(contacts.userId, userId),
            sql`(
              ${contacts.name} ILIKE ${contains}
              OR ${contacts.email} ILIKE ${contains}
            )`,
          ),
        )
        .orderBy(desc(contacts.interactionCount), desc(contacts.lastSeenAt))
        .limit(limit);
    }
  },
};
