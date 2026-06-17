import type { ActionStatus } from "@/server/db/schema/triage";
import type { actionItems } from "@/server/db/schema/triage";
import type { InferSelectModel } from "drizzle-orm";
import { apiClient } from "./axios";

type ApiResponse<T> = { success: true; message: string; data: T };

export type ActionItem = InferSelectModel<typeof actionItems>;

export const actionsApi = {
  getAll: async (status?: ActionStatus): Promise<ActionItem[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<ApiResponse<ActionItem[]>>(
      "/api/actions",
      { params },
    );
    return data.data;
  },

  updateStatus: async (id: string, status: ActionStatus): Promise<void> => {
    await apiClient.patch("/api/actions", { id, status });
  },

  getTriageQuota: async (): Promise<{
    remaining: number;
    resetInMs: number;
  }> => {
    const { data } = await apiClient.get<
      ApiResponse<{ remaining: number; resetInMs: number }>
    >("/api/actions/triage");
    return data.data;
  },

  triggerTriage: async (): Promise<{ eventId: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ eventId: string }>>(
      "/api/actions/triage",
    );
    return data.data;
  },

  // Generate ("Draft reply") or refine ("Improve") the draft for an action item.
  compose: async (
    id: string,
    payload: { instruction?: string; draft?: string } = {},
  ): Promise<{ draft: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ draft: string }>>(
      `/api/actions/${id}/compose`,
      payload,
    );
    return data.data;
  },

  // Send the (possibly edited) draft. AI sends only after the user confirms.
  send: async (id: string, draft: string): Promise<void> => {
    await apiClient.post(`/api/actions/${id}/send`, { draft });
  },
};
