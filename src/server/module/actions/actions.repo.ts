import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
  actionItems,
  ActionStatus,
  ExecutedBy,
  type ActionStatus as ActionStatusType,
} from "@/server/db/schema/triage";

export const actionsRepo = {
  findByUserId: (userId: string, status: ActionStatusType = ActionStatus.PENDING) =>
    db
      .select()
      .from(actionItems)
      .where(and(eq(actionItems.userId, userId), eq(actionItems.status, status)))
      .orderBy(desc(actionItems.createdAt)),

  findById: async (id: string, userId: string) => {
    const rows = await db
      .select()
      .from(actionItems)
      .where(and(eq(actionItems.id, id), eq(actionItems.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  updateStatus: (id: string, userId: string, status: ActionStatusType) =>
    db
      .update(actionItems)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(actionItems.id, id), eq(actionItems.userId, userId))),

  updateDraft: (id: string, userId: string, draftReply: string) =>
    db
      .update(actionItems)
      .set({ draftReply, updatedAt: new Date() })
      .where(and(eq(actionItems.id, id), eq(actionItems.userId, userId))),

  markActioned: (id: string, userId: string, draftReply: string) =>
    db
      .update(actionItems)
      .set({
        status: ActionStatus.ACTIONED,
        executedBy: ExecutedBy.USER,
        executedAt: new Date(),
        draftReply,
        updatedAt: new Date(),
      })
      .where(and(eq(actionItems.id, id), eq(actionItems.userId, userId))),
};
