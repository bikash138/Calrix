import { apiClient } from "./axios";
import type {
  InboxFilter,
  ThreadDetail,
  InboxListPage,
  ThreadRow,
} from "@/server/module/inbox/get-inbox-email.schema";
import type { InboxAction } from "@/server/module/inbox/patch-inbox-email.schema";

export type {
  InboxFilter,
  Attachment,
  ThreadRow,
  ThreadMessage,
  ThreadDetail,
  InboxListPage,
} from "@/server/module/inbox/get-inbox-email.schema";
export type { InboxAction } from "@/server/module/inbox/patch-inbox-email.schema";

type ApiResponse<T> = { success: true; message: string; data: T };

export const inboxApi = {
  listThreads: async (params: {
    filter: InboxFilter;
    pageToken?: string;
  }): Promise<InboxListPage> => {
    const { data } = await apiClient.get<ApiResponse<InboxListPage>>(
      "/api/inbox",
      {
        params: {
          filter: params.filter,
          ...(params.pageToken && { pageToken: params.pageToken }),
        },
      },
    );
    return data.data;
  },

  getThread: async (threadId: string): Promise<ThreadDetail> => {
    const { data } = await apiClient.get<ApiResponse<ThreadDetail>>(
      `/api/inbox/${threadId}`,
    );
    return data.data;
  },

  patchThread: async (threadId: string, action: InboxAction): Promise<void> => {
    await apiClient.patch(`/api/inbox/${threadId}`, { action });
  },

  deleteThread: async (threadId: string): Promise<void> => {
    await apiClient.delete(`/api/inbox/${threadId}`);
  },

  searchThreads: async (q: string): Promise<ThreadRow[]> => {
    const { data } = await apiClient.get<ApiResponse<{ threads: ThreadRow[] }>>(
      "/api/inbox/search",
      { params: { q } },
    );
    return data.data.threads;
  },
};
