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
};
