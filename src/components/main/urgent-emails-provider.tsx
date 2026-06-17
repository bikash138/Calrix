"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "inngest/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationChannel } from "@/server/inngest/channels";
import { sseApi } from "@/lib/api-client/sse.api";
import { useUserStore } from "@/store/user.store";
import { ACTIONS_QUERY_KEY } from "./actions-count-provider";

// Shape published on the `urgent-email` topic (see channels.ts).
type UrgentEmailMessage = {
  messageId: string;
  from: string;
  subject: string;
  urgency: "critical" | "high" | "normal";
  category: "reply" | "approval" | "meeting";
  aiSummary: string;
};

export type UrgentNotification = {
  id: string; // messageId
  from: string;
  subject: string;
  aiSummary: string;
  category: UrgentEmailMessage["category"];
  urgency: UrgentEmailMessage["urgency"];
  at: number;
  seen: boolean;
};

type UrgentEmailsContextValue = {
  notifications: UrgentNotification[];
  unseenCount: number;
  markAllSeen: () => void;
  clear: () => void;
};

const UrgentEmailsContext = createContext<UrgentEmailsContextValue | null>(
  null,
);

const CATEGORY_LABEL: Record<UrgentEmailMessage["category"], string> = {
  reply: "Reply needed",
  approval: "Needs approval",
  meeting: "Meeting request",
};

// "Sarah Chen <sarah@x.com>" → "Sarah Chen"
function senderName(from: string): string {
  return from.replace(/<[^>]*>/, "").trim() || from;
}

const MAX_NOTIFICATIONS = 20;

/**
 * Owns the single Inngest Realtime subscription to the `urgent-email` topic.
 * Each freshly-arrived critical email becomes a toast (the interrupt) and a
 * persisted entry in the bell feed, and invalidates the actions query so the
 * new row appears live in the /actions grid. Mounted once, above the top bar.
 */
export function UrgentEmailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useUserStore((s) => s.id);
  const qc = useQueryClient();
  const router = useRouter();

  const [notifications, setNotifications] = useState<UrgentNotification[]>([]);

  // messageIds we've already turned into a notification (guards effect re-runs).
  const processed = useRef<Set<string>>(new Set());
  // Ignore history replayed on (re)connect — only react to messages newer than
  // when this provider mounted. Seeded on the effect's first run (0 = unset).
  const mountedAt = useRef<number>(0);

  const { messages } = useRealtime({
    channel: notificationChannel({ userId }),
    topics: ["urgent-email"],
    token: sseApi.getRealtimeToken,
    enabled: Boolean(userId),
    // The channel's Zod schemas can't survive JSON serialization to the
    // browser (the token is sent over the wire), so client-side validation
    // would crash on `schema["~standard"]`. We trust the server-published shape.
    validate: false,
  });

  useEffect(() => {
    // First run: anchor the replay cutoff and treat anything already buffered
    // as history (no toast for messages that predate this session).
    if (mountedAt.current === 0) {
      mountedAt.current = Date.now();
      return;
    }

    // The realtime hook widens `all` to a union that includes stream-kind
    // messages without `createdAt`; the data messages we publish carry it.
    const all = messages.all as unknown as Array<{
      topic?: string;
      data?: unknown;
      createdAt?: string | Date;
    }>;

    for (const msg of all) {
      if (msg.topic !== "urgent-email" || !msg.createdAt) continue;

      const at = new Date(msg.createdAt).getTime();
      if (at <= mountedAt.current) continue;

      const data = msg.data as UrgentEmailMessage | undefined;
      if (!data?.messageId || processed.current.has(data.messageId)) continue;
      processed.current.add(data.messageId);

      setNotifications((prev) =>
        [
          {
            id: data.messageId,
            from: data.from,
            subject: data.subject,
            aiSummary: data.aiSummary,
            category: data.category,
            urgency: data.urgency,
            at,
            seen: false,
          },
          ...prev,
        ].slice(0, MAX_NOTIFICATIONS),
      );

      toast(`${CATEGORY_LABEL[data.category]} · ${senderName(data.from)}`, {
        description: data.aiSummary,
        duration: 8000,
        action: {
          label: "View",
          onClick: () => router.push("/actions"),
        },
      });

      // The toast/bell render from the payload; the grid always re-reads the DB.
      qc.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    }
  }, [messages.all, qc, router]);

  const markAllSeen = useCallback(() => {
    setNotifications((prev) =>
      prev.some((n) => !n.seen)
        ? prev.map((n) => ({ ...n, seen: true }))
        : prev,
    );
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  const unseenCount = notifications.reduce((c, n) => c + (n.seen ? 0 : 1), 0);

  return (
    <UrgentEmailsContext.Provider
      value={{ notifications, unseenCount, markAllSeen, clear }}
    >
      {children}
    </UrgentEmailsContext.Provider>
  );
}

export function useUrgentEmails(): UrgentEmailsContextValue {
  const ctx = useContext(UrgentEmailsContext);
  if (!ctx) {
    throw new Error("useUrgentEmails must be used within UrgentEmailsProvider");
  }
  return ctx;
}
