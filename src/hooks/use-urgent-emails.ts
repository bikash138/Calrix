"use client";

import { useRealtime } from "inngest/react";
import { notificationChannel } from "@/server/inngest/channels";
import { z } from "zod";
import { sseApi } from "@/lib/api-client/sse.api";

const UrgentEmailSchema = z.object({
  messageId: z.string(),
  from: z.string(),
  subject: z.string(),
  urgency: z.enum(["critical", "high", "normal"]),
  category: z.enum(["reply", "approval", "meeting"]),
  aiSummary: z.string(),
});

export type UrgentEmail = z.infer<typeof UrgentEmailSchema>;

export function useUrgentEmails(userId: string) {
  const { messages, connectionStatus, error } = useRealtime({
    channel: notificationChannel({ userId }),
    topics: ["urgent-email"],
    token: sseApi.getRealtimeToken,
  });

  const raw = (messages.byTopic["urgent-email"] ?? []) as unknown[];

  const emails = raw
    .map((m) => {
      const parsed = UrgentEmailSchema.safeParse(m);
      return parsed.success ? parsed.data : null;
    })
    .filter((e): e is UrgentEmail => e !== null)
    .reverse();

  return { emails, connectionStatus, error };
}
