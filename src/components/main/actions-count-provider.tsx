"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actionsApi,
  type ActionItem as DBActionItem,
} from "@/lib/api-client/actions.api";
import { ActionStatus } from "@/server/db/schema/triage";

export const ACTIONS_QUERY_KEY = ["actions", "pending"] as const;

//UI type

export type SectionId =
  | "reply"
  | "approval"
  | "meeting"
  | "waiting"
  | "overdue";

export type UIActionItem = {
  id: string;
  section: SectionId;
  avatar: string;
  avatarColor: string;
  title: string;
  meta: string;
  time: string;
  context: string;
  primary: string;
  secondary?: string;
  urgency?: "critical" | "high" | "normal";
  // Raw fields the reply modal needs
  threadId: string;
  sender: string;
  subject: string;
  draftReply: string | null;
  aiSummary: string;
  suggestedAction: string;
  autonomyReason: string;
  riskFactors: string[];
  // Meeting items: concrete slot to book on accept (set only when free).
  proposedSlot: { start: string; end: string } | null;
};

//Mapping helpers

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-lime-600",
  "bg-rose-500",
];

function colorForSender(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++)
    hash = sender.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function initialsFromSender(sender: string): string {
  const name = sender.replace(/<.*>/, "").trim();
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SECTION_BUTTONS: Record<
  SectionId,
  { primary: string; secondary?: string }
> = {
  reply: { primary: "Reply", secondary: "Later" },
  approval: { primary: "Approve", secondary: "Reject" },
  meeting: { primary: "Accept", secondary: "Decline" },
  waiting: { primary: "Remind", secondary: "Dismiss" },
  overdue: { primary: "Follow Up", secondary: "Dismiss" },
};

function toUIItem(item: DBActionItem): UIActionItem {
  const section = item.category as SectionId;
  const buttons = SECTION_BUTTONS[section];
  return {
    id: item.id,
    section,
    avatar: initialsFromSender(item.sender),
    avatarColor: colorForSender(item.sender),
    title: item.subject,
    meta: item.sender.replace(/<.*>/, "").trim(),
    time: relativeTime(item.createdAt),
    context: item.aiSummary,
    urgency: item.urgency as UIActionItem["urgency"],
    primary: buttons.primary,
    secondary: buttons.secondary,
    threadId: item.threadId,
    sender: item.sender,
    subject: item.subject,
    draftReply: item.draftReply,
    aiSummary: item.aiSummary,
    suggestedAction: item.suggestedAction,
    autonomyReason: item.autonomyReason,
    riskFactors: item.riskFactors ?? [],
    proposedSlot: item.proposedSlot ?? null,
  };
}

//Hook

export function useActionsCount() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ACTIONS_QUERY_KEY,
    queryFn: () => actionsApi.getAll(ActionStatus.PENDING),
    select: (rows) => rows.map(toUIItem),
    staleTime: 1000 * 60 * 2,
  });

  const items = data ?? [];

  const dismiss = useCallback(
    (...ids: string[]) => {
      qc.setQueryData<DBActionItem[]>(ACTIONS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((i) => !ids.includes(i.id)),
      );
      ids.forEach((id) => {
        actionsApi
          .updateStatus(id, ActionStatus.DISMISSED)
          .catch(console.error);
      });
    },
    [qc],
  );

  // Drop an item from the cache without changing status — used after a send,
  // where the server has already marked it ACTIONED.
  const removeLocal = useCallback(
    (id: string) => {
      qc.setQueryData<DBActionItem[]>(ACTIONS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((i) => i.id !== id),
      );
    },
    [qc],
  );

  return { items, pendingCount: items.length, isLoading, dismiss, removeLocal };
}
