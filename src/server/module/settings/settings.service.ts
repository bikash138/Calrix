import { ApiError } from "@/server/errors/api.error";
import { settingsRepo } from "./settings.repo";
import type { UserPreferences } from "@/server/db/schema/settings";

export const settingsService = {
  getAll: async (userId: string): Promise<UserPreferences> => {
    const prefs = await settingsRepo.findByUserId(userId);
    if (!prefs) throw ApiError.notFound("Settings not found");
    return prefs;
  },

  update: async (
    userId: string,
    data: UserPreferences,
  ): Promise<UserPreferences> => {
    await settingsRepo.update(userId, data);
    return data;
  },
};
