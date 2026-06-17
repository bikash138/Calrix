"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRealtime } from "inngest/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  notificationChannel,
  triageProgressSchema,
} from "@/server/inngest/channels";
import { sseApi } from "@/lib/api-client/sse.api";
import { actionsApi } from "@/lib/api-client/actions.api";
import { ACTIONS_QUERY_KEY } from "@/components/main/actions-count-provider";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

type TriageState = { status: SyncStatus; phase: string | null };
type TriageAction =
  | { type: "syncing" }
  | { type: "completed" }
  | { type: "failed"; error: string | null }
  | { type: "progress"; phase: string | null }
  | { type: "reset" };

function triageReducer(_state: TriageState, action: TriageAction): TriageState {
  switch (action.type) {
    case "syncing":
      return { status: "syncing", phase: "Starting…" };
    case "completed":
      return { status: "synced", phase: null };
    case "failed":
      return { status: "error", phase: action.error };
    case "progress":
      return { status: "syncing", phase: action.phase };
    case "reset":
      return { status: "idle", phase: null };
  }
}

const TRIAGE_LIMIT = 3;

/**
 * Triggers the triage pipeline and reflects its live progress (emitted over
 * Inngest Realtime on the `triage-progress` topic) as a status + phase the
 * Sync button can render. Resolves to `synced`/`error` on the terminal event
 * and invalidates the actions query so freshly-triaged items appear.
 */
export function useTriageSync(userId: string) {
  const qc = useQueryClient();
  const [{ status, phase }, dispatch] = useReducer(triageReducer, {
    status: "idle",
    phase: null,
  });
  const [remaining, setRemaining] = useState(TRIAGE_LIMIT);
  const [resetInMs, setResetInMs] = useState(0);

  useEffect(() => {
    actionsApi
      .getTriageQuota()
      .then((q) => {
        setRemaining(q.remaining);
        setResetInMs(q.resetInMs);
      })
      .catch(() => {});
  }, []);

  // Server `createdAt` (ms) of the newest message we've already handled — lets
  // us ignore events buffered from a previous run without comparing across
  // client/server clocks.
  const seenAtRef = useRef(0);
  // Ref-based guard so the message effect doesn't need `status` in its deps.
  const isSyncingRef = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const { messages } = useRealtime({
    channel: notificationChannel({ userId }),
    topics: ["triage-progress"],
    token: sseApi.getRealtimeToken,
    enabled: Boolean(userId),
  });

  // The realtime hook widens `byTopic` to a union that doesn't always expose
  // `createdAt`; the data-kind messages we publish always carry it.
  const last = messages.byTopic["triage-progress"] as
    | { data: unknown; createdAt: string | Date }
    | undefined;

  useEffect(() => {
    if (!isSyncingRef.current || !last) return;

    const at = new Date(last.createdAt).getTime();
    if (at <= seenAtRef.current) return;
    seenAtRef.current = at;

    const parsed = triageProgressSchema.safeParse(last.data);
    if (!parsed.success) return;
    const p = parsed.data;

    if (p.status === "completed") {
      isSyncingRef.current = false;
      clearTimeout(safetyTimer.current);
      dispatch({ type: "completed" });
      qc.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
      resetTimer.current = setTimeout(() => dispatch({ type: "reset" }), 2500);
    } else if (p.status === "failed") {
      isSyncingRef.current = false;
      clearTimeout(safetyTimer.current);
      dispatch({ type: "failed", error: p.error ?? null });
      resetTimer.current = setTimeout(() => dispatch({ type: "reset" }), 4000);
    } else {
      dispatch({ type: "progress", phase: p.phase ?? null });
    }
  }, [last, qc]);

  useEffect(
    () => () => {
      clearTimeout(resetTimer.current);
      clearTimeout(safetyTimer.current);
    },
    [],
  );

  const sync = useCallback(async () => {
    if (status === "syncing" || remaining === 0) return;
    clearTimeout(resetTimer.current);

    // Anchor on the latest already-seen event so we only react to this run's.
    seenAtRef.current = last ? new Date(last.createdAt).getTime() : 0;
    isSyncingRef.current = true;
    dispatch({ type: "syncing" });

    try {
      await actionsApi.triggerTriage();
      // Refetch quota so the tooltip stays accurate after the trigger.
      actionsApi
        .getTriageQuota()
        .then((q) => {
          setRemaining(q.remaining);
          setResetInMs(q.resetInMs);
        })
        .catch(() => {});
      safetyTimer.current = setTimeout(() => {
        isSyncingRef.current = false;
        dispatch({ type: "failed", error: "Timed out" });
        resetTimer.current = setTimeout(
          () => dispatch({ type: "reset" }),
          4000,
        );
      }, 30_000);
    } catch (err: unknown) {
      isSyncingRef.current = false;
      const httpStatus = (err as { response?: { status?: number } })?.response
        ?.status;
      if (httpStatus === 429) {
        setRemaining(0);
        dispatch({ type: "reset" });
      } else {
        dispatch({ type: "failed", error: "Failed to start" });
        resetTimer.current = setTimeout(
          () => dispatch({ type: "reset" }),
          4000,
        );
      }
    }
  }, [status, last, remaining]);

  return { sync, status, phase, remaining, resetInMs };
}
