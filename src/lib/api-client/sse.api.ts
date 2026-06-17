import { apiClient } from "./axios";

export const sseApi = {
  getRealtimeToken: async (): Promise<{ key: string; apiBaseUrl?: string }> => {
    const { data } = await apiClient.get<{ token: { key: string; apiBaseUrl?: string } }>(
      "/api/realtime/token"
    );
    return data.token;
  },
};
