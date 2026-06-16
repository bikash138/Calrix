import { apiClient } from "./axios";

export const accountApi = {
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/api/account");
  },
};
