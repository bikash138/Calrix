"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  disabled?: boolean;
  submitLabel?: string;
};

/** Shared chrome for input-bar widgets: header (icon + question + cancel) and footer (cancel + confirm). */
export function WidgetShell({
  icon,
  label,
  children,
  onSubmit,
  onCancel,
  canSubmit,
  disabled,
  submitLabel = "Confirm",
}: Props) {
  // Enter confirms (Shift+Enter keeps a newline). Only from text fields, so
  // buttons like the date-picker trigger keep their native Enter behavior.
  function handleKeyDown(e: React.KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (tag === "INPUT" || tag === "TEXTAREA")
    ) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">{icon}</span>
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

      <div onKeyDown={handleKeyDown}>{children}</div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={disabled}
          className="rounded-full px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || !canSubmit}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            !disabled && canSubmit
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
          )}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export const widgetInputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-orange-400 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100";
export const widgetLabelCls = "text-[11px] font-medium text-zinc-500 dark:text-zinc-400";
