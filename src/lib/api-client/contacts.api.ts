import { apiClient } from "./axios";
import type { ContactMatch } from "@/server/module/contacts/contacts.repo";

export type { ContactMatch } from "@/server/module/contacts/contacts.repo";

type ApiResponse<T> = { success: true; message: string; data: T };

export const contactsApi = {
  search: async (q: string): Promise<ContactMatch[]> => {
    const { data } = await apiClient.get<ApiResponse<{ contacts: ContactMatch[] }>>(
      "/api/contacts/search",
      { params: { q } },
    );
    return data.data.contacts;
  },

  getSyncQuota: async (): Promise<{ remaining: number; resetInMs: number }> => {
    const { data } = await apiClient.get<ApiResponse<{ remaining: number; resetInMs: number }>>(
      "/api/contacts/sync",
    );
    return data.data;
  },

  sync: async (): Promise<{ eventId: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ eventId: string }>>(
      "/api/contacts/sync",
    );
    return data.data;
  },
};
