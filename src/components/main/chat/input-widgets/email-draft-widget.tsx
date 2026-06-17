"use client";

import { useState } from "react";
import { Mail, X, ArrowUp } from "lucide-react";
import type { UserInputResult } from "@/lib/request-input.schema";
import { LogoMark } from "@/assets/logo";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  to: string;
  subject: string;
  body: string;
  onSubmit: (result: UserInputResult) => void;
  /** Escape hatch — bail out and type instead. */
  onCancel: () => void;
  disabled?: boolean;
};

export function EmailDraftWidget({
  label,
  to,
  subject: initialSubject,
  body: initialBody,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [improveOpen, setImproveOpen] = useState(false);
  const [instruction, setInstruction] = useState("");

  function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    onSubmit({
      status: "email",
      email: { to, subject: subject.trim(), body: body.trim() },
    });
  }

  function handleDecline() {
    onSubmit({
      status: "declined",
      reason: "User chose not to send the email.",
    });
  }

  function handleImprove() {
    if (!instruction.trim()) return;
    onSubmit({
      status: "revise",
      instruction: instruction.trim(),
      email: { to, subject: subject.trim(), body: body.trim() },
    });
  }

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <button
          onClick={onCancel}
          disabled={disabled}
          title="Cancel — type instead"
          className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Draft, laid out like an email */}
      <div
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-white/10">
          <span className="text-[11px] font-medium text-zinc-400">To</span>
          <span className="truncate text-sm text-foreground">{to}</span>
        </div>
        <div className="border-b border-zinc-100 px-3 py-1.5 dark:border-white/10">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={disabled}
            placeholder="Subject"
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={disabled}
          rows={7}
          placeholder="Email body…"
          className="max-h-64 w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-zinc-400 disabled:opacity-50"
        />
      </div>

      {/* Improve with AI */}
      {improveOpen && (
        <div className="mt-3 flex items-end gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-2 dark:border-orange-900/40 dark:bg-orange-950/20">
          <textarea
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && instruction.trim()) {
                e.preventDefault();
                handleImprove();
              }
            }}
            disabled={disabled}
            rows={1}
            placeholder="How should I refine it? e.g. make it shorter, more formal…"
            className="max-h-24 w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-zinc-400 disabled:opacity-50"
          />
          <button
            onClick={handleImprove}
            disabled={disabled || !instruction.trim()}
            title="Send to Calrix to refine"
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
              !disabled && instruction.trim()
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
            )}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => setImproveOpen((v) => !v)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            improveOpen
              ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
              : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30",
          )}
        >
          <LogoMark size={14} className="h-3.5 w-3.5 rounded-sm" />
          Improve
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            disabled={disabled}
            className="rounded-full px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Don&apos;t send
          </button>
          <button
            onClick={handleSend}
            disabled={disabled || !subject.trim() || !body.trim()}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              !disabled && subject.trim() && body.trim()
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
