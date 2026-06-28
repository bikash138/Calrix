import type { UserFact } from "@/server/module/user-facts/user-facts.repo";
import { apiClient } from "./axios";

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type { UserFact };

export const userFactsApi = {
  warm: async (): Promise<ApiResponse<{ warmed: boolean }>> => {
    const { data } = await apiClient.post<ApiResponse<{ warmed: boolean }>>(
      "/api/user-facts/warm",
    );
    return data;
  },

  list: async (): Promise<ApiResponse<UserFact[]>> => {
    const { data } =
      await apiClient.get<ApiResponse<UserFact[]>>("/api/user-facts");
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<{ removed: boolean }>> => {
    const { data } = await apiClient.delete<ApiResponse<{ removed: boolean }>>(
      `/api/user-facts?id=${encodeURIComponent(id)}`,
    );
    return data;
  },
};
