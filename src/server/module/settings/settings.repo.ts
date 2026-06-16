import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";
import type { UserPreferences } from "@/server/db/schema/settings";

const prefsCache = new Map<string, UserPreferences>();

export const settingsRepo = {
  findByUserId: async (userId: string) => {
    if (prefsCache.has(userId)) return prefsCache.get(userId)!;

    const [row] = await db
      .select({ userPreferences: user.userPreferences })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const prefs = row?.userPreferences ?? null;
    if (prefs) prefsCache.set(userId, prefs);
    return prefs;
  },

  update: (userId: string, data: UserPreferences) => {
    prefsCache.delete(userId);
    return db
      .update(user)
      .set({ userPreferences: data })
      .where(eq(user.id, userId));
  },
};
