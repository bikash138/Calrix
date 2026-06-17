"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Sparkles,
  ArrowUp,
  Loader2,
  AlertTriangle,
  Send,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFullDate } from "@/lib/inbox-utils";
import { inboxApi } from "@/lib/api-client/inbox.api";
import { actionsApi } from "@/lib/api-client/actions.api";
import { LogoMark } from "@/assets/logo";
import type { UIActionItem } from "../actions-count-provider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function formatSlot(slot: { start: string; end: string }): string {
  const start = new Date(slot.start);
  const day = start.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} at ${time}`;
}

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  normal: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
};

export function ActionReplyModal({
  item,
  onClose,
  onSent,
}: {
  item: UIActionItem | null;
  onClose: () => void;
  onSent: (id: string) => void;
}) {
  // State is seeded from the item; the parent remounts this via `key` per item,
  // so a fresh open always starts from the item's own draft.
  const [draft, setDraft] = useState(item?.draftReply ?? "");
  const [instruction, setInstruction] = useState("");
  const [improveOpen, setImproveOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: thread, isPending: threadLoading } = useQuery({
    queryKey: ["inbox", "thread", item?.threadId],
    queryFn: () => inboxApi.getThread(item!.threadId),
    enabled: !!item,
  });

  if (!item) return null;

  const busy = composing || sending;

  async function draftReply(withInstruction: boolean) {
    if (!item) return;
    setComposing(true);
    setError(null);
    try {
      const { draft: next } = await actionsApi.compose(item.id, {
        instruction: withInstruction
          ? instruction.trim() || undefined
          : undefined,
        // Pass the current text only when refining, so a fresh draft starts clean.
        draft: withInstruction ? draft.trim() || undefined : undefined,
      });
      setDraft(next);
      if (withInstruction) {
        setInstruction("");
        setImproveOpen(false);
      }
    } catch {
      setError("Couldn't draft a reply. Try again.");
    } finally {
      setComposing(false);
    }
  }

  async function handleSend() {
    if (!item || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await actionsApi.send(item.id, draft.trim());
      onSent(item.id);
    } catch {
      setError("Couldn't send the email. Try again.");
      setSending(false);
    }
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open && !sending) onClose();
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-5 py-3.5">
          <Mail className="h-4 w-4 text-orange-500" />
          <DialogTitle className="truncate">
            {item.section === "waiting" || item.section === "overdue"
              ? `Follow up with ${item.meta}`
              : `Reply to ${item.meta}`}
          </DialogTitle>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* AI insight panel */}
          <div className="mb-4 rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[0.7rem] font-semibold text-foreground">
                {item.subject}
              </span>
              {item.urgency && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[0.6rem] font-medium capitalize",
                    URGENCY_STYLES[item.urgency],
                  )}
                >
                  {item.urgency}
                </span>
              )}
            </div>
            <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
              {item.aiSummary}
            </p>
            {item.suggestedAction && (
              <p className="mt-2 flex items-start gap-1.5 text-[0.72rem] text-foreground/80">
                <Sparkles className="mt-px h-3 w-3 shrink-0 text-accent" />
                <span>{item.suggestedAction}</span>
              </p>
            )}
            {item.proposedSlot && (
              <p className="mt-2 flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[0.7rem] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                Sending will book: {formatSlot(item.proposedSlot)}
              </p>
            )}
            {(item.autonomyReason || item.riskFactors.length > 0) && (
              <div className="mt-2 border-t border-border/60 pt-2">
                {item.autonomyReason && (
                  <p className="text-[0.66rem] italic text-muted-foreground/70">
                    {item.autonomyReason}
                  </p>
                )}
                {item.riskFactors.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.riskFactors.map((rf) => (
                      <span
                        key={rf}
                        className="rounded border border-amber-300/60 bg-amber-50 px-1.5 py-px text-[0.6rem] text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        {rf}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Original thread */}
          <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Conversation
          </p>
          <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
            {threadLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading thread…
              </div>
            ) : thread && thread.messages.length > 0 ? (
              thread.messages.map((m) => (
                <div key={m.id} className="px-3 py-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[0.7rem] font-medium text-foreground">
                      {m.senderName}
                    </span>
                    <span className="shrink-0 text-[0.62rem] text-muted-foreground">
                      {formatFullDate(m.date)}
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-[0.7rem] leading-relaxed text-muted-foreground">
                    {m.textBody.replace(/\s+/g, " ").trim()}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Couldn&apos;t load the thread.
              </div>
            )}
          </div>

          {/* Draft */}
          <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Your reply
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={busy}
            rows={8}
            placeholder={
              composing
                ? "Drafting…"
                : "Write a reply, or hit Draft reply to generate one…"
            }
            className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-[0.78rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-foreground/30 disabled:opacity-60"
          />

          {/* Improve */}
          {improveOpen && (
            <div className="mt-2 flex items-end gap-2 rounded-xl border border-accent/30 bg-accent/5 p-2">
              <textarea
                autoFocus
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && instruction.trim()) {
                    e.preventDefault();
                    draftReply(true);
                  }
                }}
                disabled={busy}
                rows={1}
                placeholder="How should I refine it? e.g. shorter, more formal…"
                className="max-h-24 w-full resize-none bg-transparent px-1.5 py-1 text-[0.78rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
              />
              <button
                onClick={() => draftReply(true)}
                disabled={busy || !instruction.trim()}
                title="Refine with AI"
                className={cn(
                  "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
                  !busy && instruction.trim()
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
              >
                {composing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] text-rose-600">
              <AlertTriangle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => draftReply(false)}
              disabled={busy}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[0.7rem] font-medium text-foreground transition-all duration-150 hover:-translate-y-px hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {composing && !improveOpen ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogoMark size={14} className="h-3.5 w-3.5 rounded-sm" />
              )}
              Draft reply
            </button>
            <button
              onClick={() => setImproveOpen((v) => !v)}
              disabled={busy || !draft.trim()}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                improveOpen
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Improve
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={busy || !draft.trim()}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-[0.72rem] font-medium transition-all duration-150",
              !busy && draft.trim()
                ? "bg-orange-500 text-white hover:-translate-y-px hover:bg-orange-600"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
