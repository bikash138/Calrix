import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";
import type { UserPreferences } from "@/server/db/schema/settings";

export const onboardingRepo = {
  complete: (userId: string, preferences: UserPreferences) =>
    db
      .update(user)
      .set({ userPreferences: preferences, completedOnboarding: true })
      .where(eq(user.id, userId)),
};
