"use client";

import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

type KeyColor = "indigo" | "rose" | "amber" | "emerald" | "blue" | "violet";

const KEY_COLORS: Record<KeyColor, string> = {
  indigo:  "border-indigo-200  bg-indigo-50  text-indigo-700  dark:border-indigo-800  dark:bg-indigo-950/50 dark:text-indigo-300",
  violet:  "border-violet-200  bg-violet-50  text-violet-700  dark:border-violet-800  dark:bg-violet-950/50 dark:text-violet-300",
  rose:    "border-rose-200    bg-rose-50    text-rose-700    dark:border-rose-800    dark:bg-rose-950/50   dark:text-rose-300",
  amber:   "border-amber-200   bg-amber-50   text-amber-700   dark:border-amber-800   dark:bg-amber-950/50  dark:text-amber-300",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  blue:    "border-blue-200    bg-blue-50    text-blue-700    dark:border-blue-800    dark:bg-blue-950/50   dark:text-blue-300",
};

const GROUPS = [
  {
    title: "Navigation",
    dot: "bg-indigo-500",
    shortcuts: [
      { keys: ["j", "↓"], desc: "Next email",     keyColor: "indigo" as KeyColor },
      { keys: ["k", "↑"], desc: "Previous email", keyColor: "indigo" as KeyColor },
      { keys: ["Esc"],    desc: "Close email",    keyColor: "violet" as KeyColor },
      { keys: ["/"],      desc: "Focus search",   keyColor: "blue"   as KeyColor },
    ],
  },
  {
    title: "Actions",
    dot: "bg-violet-500",
    shortcuts: [
      { keys: ["e"],   desc: "Archive",         keyColor: "blue"    as KeyColor },
      { keys: ["#"],   desc: "Delete",          keyColor: "rose"    as KeyColor },
      { keys: ["s"],   desc: "Star / Unstar",   keyColor: "amber"   as KeyColor },
      { keys: ["u"],   desc: "Mark as unread",  keyColor: "violet"  as KeyColor },
      { keys: ["⇧R"],  desc: "Refresh",         keyColor: "emerald" as KeyColor },
      { keys: ["?"],   desc: "Show shortcuts",  keyColor: "indigo"  as KeyColor },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-linear-to-r from-indigo-50/60 via-violet-50/40 to-transparent px-5 py-4 dark:from-indigo-950/30 dark:via-violet-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <Keyboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Keyboard shortcuts</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Press{" "}
                <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">
                  ?
                </kbd>{" "}
                to toggle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-accent"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </div>

        {/* Groups — two columns */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {GROUPS.map((group) => (
            <div key={group.title} className="px-5 py-5">
              <div className="mb-3.5 flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", group.dot)} />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.title}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {group.shortcuts.map(({ keys, desc, keyColor }) => (
                  <div key={desc} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-foreground/80">{desc}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1">
                          <kbd className={cn(
                            "min-w-[24px] rounded-md border px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold",
                            KEY_COLORS[keyColor],
                          )}>
                            {key}
                          </kbd>
                          {i < keys.length - 1 && (
                            <span className="text-[9px] text-muted-foreground">or</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
