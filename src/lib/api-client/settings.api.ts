import type { z } from "zod";
import type { preferencesSchema } from "@/server/module/settings/settings.schema";
import type { UserPreferences } from "@/server/db/schema/settings";
import { apiClient } from "./axios";

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type { UserPreferences as AllSettings };

export const settingsApi = {
  getAll: async (
    headers?: Record<string, string>,
  ): Promise<ApiResponse<UserPreferences>> => {
    const { data } = await apiClient.get<ApiResponse<UserPreferences>>(
      "/api/settings",
      { headers },
    );
    return data;
  },

  update: async (
    payload: z.infer<typeof preferencesSchema>,
  ): Promise<ApiResponse<UserPreferences>> => {
    const { data } = await apiClient.patch<ApiResponse<UserPreferences>>(
      "/api/settings",
      payload,
    );
    return data;
  },
};
