import { channel } from "inngest/realtime";
import { z } from "zod";

export const triageProgressSchema = z.object({
  status: z.enum(["started", "running", "completed", "failed"]),
  phase: z.string().optional(),
  actionableItems: z.number().optional(),
  waitingItems: z.number().optional(),
  overdueItems: z.number().optional(),
  error: z.string().optional(),
});

export type TriageProgress = z.infer<typeof triageProgressSchema>;

export const notificationChannel = channel({
  name: ({ userId }: { userId: string }) => `user:${userId}`,
  topics: {
    "urgent-email": {
      schema: z.object({
        messageId: z.string(),
        from: z.string(),
        subject: z.string(),
        urgency: z.enum(["critical", "high", "normal"]),
        category: z.enum(["reply", "approval", "meeting"]),
        aiSummary: z.string(),
      }),
    },
    "triage-progress": {
      schema: triageProgressSchema,
    },
  },
});
