"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  ArrowUp,
  Loader2,
  AlertTriangle,
  Send,
  CalendarCheck,
  X,
  Flame,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFullDate } from "@/lib/inbox-utils";
import { inboxApi } from "@/lib/api-client/inbox.api";
import { actionsApi } from "@/lib/api-client/actions.api";
import { LogoMark } from "@/assets/logo";
import type { UIActionItem } from "../actions-count-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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

// Icon + tint shown beside the suggested action, picked by urgency.
const URGENCY_ICON: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  critical: { icon: Flame, color: "text-rose-500" },
  high: { icon: AlertTriangle, color: "text-amber-500" },
  normal: { icon: Info, color: "text-emerald-500" },
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

  // Keyboard shortcuts: ⌘/Ctrl+D drafts a reply. (Esc to close is handled by
  // the Dialog itself, but is blocked mid-send via onOpenChange below.)
  useEffect(() => {
    if (!item) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (!composing && !sending) void draftReply(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, composing, sending]);

  if (!item) return null;

  const busy = composing || sending;
  const modKey =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform)
      ? "⌘"
      : "Ctrl";
  const urgencyMeta = URGENCY_ICON[item.urgency ?? "normal"] ?? URGENCY_ICON.normal!;
  const UrgencyIcon = urgencyMeta.icon;

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

  const isFollowUp = item.section === "waiting" || item.section === "overdue";

  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open && !sending) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[86vh] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl shadow-black/20 ring-1 ring-border/80 sm:max-w-2xl"
      >
        {/* Decorative top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-500/10 via-orange-500/[0.03] to-transparent"
        />

        {/* Header */}
        <div className="relative flex shrink-0 items-center gap-3 border-b border-border/70 px-5 py-4">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-white shadow-sm ring-2 ring-background",
              item.avatarColor,
            )}
          >
            {item.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-[0.95rem] leading-tight">
              {isFollowUp ? "Follow up" : "Reply"}
              <span className="text-muted-foreground"> · {item.meta}</span>
            </DialogTitle>
            <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground/70">
              {item.subject}
            </p>
          </div>
          <DialogClose
            title="Close (Esc)"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close (Esc)</span>
          </DialogClose>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Calrix Read panel */}
          <div className="mb-4 rounded-2xl border border-orange-500/20 bg-card p-4 shadow-sm">
            <div>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <LogoMark size={12} className="h-3 w-3 rounded-sm" />
                  Calrix Read
                </span>
                {item.urgency && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold capitalize",
                      URGENCY_STYLES[item.urgency],
                    )}
                  >
                    {item.urgency}
                  </span>
                )}
              </div>
              <p className="text-[0.74rem] leading-relaxed text-foreground/90">
                {item.aiSummary}
              </p>
              {item.suggestedAction && (
                <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-foreground/[0.03] px-2.5 py-1.5 text-[0.72rem] text-foreground/80">
                  <UrgencyIcon
                    className={cn("mt-px h-3 w-3 shrink-0", urgencyMeta.color)}
                  />
                  <span>{item.suggestedAction}</span>
                </p>
              )}
              {item.proposedSlot && (
                <p className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-50 px-2.5 py-1.5 text-[0.7rem] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                  Sending will book: {formatSlot(item.proposedSlot)}
                </p>
              )}
              {(item.autonomyReason || item.riskFactors.length > 0) && (
                <div className="mt-2.5 border-t border-border/50 pt-2.5">
                  {item.autonomyReason && (
                    <p className="text-[0.66rem] italic text-muted-foreground/70">
                      {item.autonomyReason}
                    </p>
                  )}
                  {item.riskFactors.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.riskFactors.map((rf) => (
                        <span
                          key={rf}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-50 px-1.5 py-0.5 text-[0.6rem] text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {rf}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Original thread */}
          <p className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
            <Mail className="h-3 w-3" />
            Conversation
          </p>
          <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-border/70 bg-muted/20 divide-y divide-border/50">
            {threadLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading thread…
              </div>
            ) : thread && thread.messages.length > 0 ? (
              thread.messages.map((m) => (
                <div key={m.id} className="px-3.5 py-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[0.7rem] font-semibold text-foreground">
                      {m.senderName}
                    </span>
                    <span className="shrink-0 text-[0.62rem] text-muted-foreground/70">
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
          <p className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
            <Send className="h-3 w-3" />
            Your reply
          </p>
          <div className="rounded-xl border border-border bg-card shadow-sm transition-colors focus-within:border-orange-500/40 focus-within:ring-2 focus-within:ring-orange-500/10">
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
              className="w-full resize-none rounded-xl bg-transparent px-3.5 py-3 text-[0.78rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
            />
          </div>

          {/* Improve */}
          {improveOpen && (
            <div className="mt-2 flex items-end gap-2 rounded-xl border border-orange-500/30 bg-orange-500/5 p-2 shadow-sm">
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
                  "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all",
                  !busy && instruction.trim()
                    ? "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
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
        <div className="relative flex shrink-0 items-center justify-between gap-2 border-t border-border/70 bg-muted/40 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => draftReply(false)}
              disabled={busy}
              title={`Draft reply (${modKey}D)`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[0.7rem] font-medium text-foreground shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-orange-500/30 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {composing && !improveOpen ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogoMark size={14} className="h-3.5 w-3.5 rounded-sm" />
              )}
              Draft reply
              <kbd className="ml-0.5 rounded border border-border bg-muted px-1 py-px font-sans text-[0.55rem] font-medium text-muted-foreground/70">
                {modKey}D
              </kbd>
            </button>
            <button
              onClick={() => setImproveOpen((v) => !v)}
              disabled={busy || !draft.trim()}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-[0.7rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
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
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-5 py-1.5 text-[0.72rem] font-semibold transition-all duration-150",
              !busy && draft.trim()
                ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25 hover:-translate-y-px hover:shadow-lg hover:shadow-orange-500/30"
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
