"use client";

import { cn } from "@/lib/utils";
import { KEYBOARD_SHORTCUTS, COLOR_STYLES } from "@/data/keyboard-shortcuts";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const COMING_SOON_BG: Record<string, string> = {
  violet:
    "border-violet-200/30 bg-violet-50/10 dark:border-violet-800/20 dark:bg-violet-950/5",
  sky: "border-sky-200/30    bg-sky-50/10    dark:border-sky-800/20    dark:bg-sky-950/5",
  rose: "border-rose-200/30   bg-rose-50/10   dark:border-rose-800/20   dark:bg-rose-950/5",
};

export function ShortcutsSection() {
  const inbox = KEYBOARD_SHORTCUTS.find((g) => g.id === "inbox")!;
  const ai = KEYBOARD_SHORTCUTS.find((g) => g.id === "ai")!;
  const others = KEYBOARD_SHORTCUTS.filter(
    (g) => g.id !== "inbox" && g.id !== "ai",
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Inbox hero card — left 2 cols */}
        <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/20 p-4 dark:border-indigo-800/30 dark:bg-indigo-950/10 sm:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Inbox
            </p>
            <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[0.63rem] font-medium text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400">
              {inbox.shortcuts.length} shortcuts
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-5">
            {inbox.shortcuts.map((s) => (
              <div
                key={s.desc}
                className="flex items-center justify-between border-b border-indigo-100/60 py-2 last:border-0 dark:border-indigo-900/40"
              >
                <span className="text-[0.72rem] text-foreground/75">
                  {s.desc}
                </span>
                <KbdGroup>
                  {s.primary.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                  {s.alt && (
                    <>
                      <span className="mx-0.5 text-[9px] text-muted-foreground/40">
                        or
                      </span>
                      {s.alt.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </>
                  )}
                </KbdGroup>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {/* Calrix AI accent card */}
          <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/20 p-4 dark:border-amber-700/30 dark:from-amber-950/20 dark:to-transparent">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                {ai.title}
              </p>
            </div>
            {ai.shortcuts.map((s) => (
              <div key={s.desc} className="flex items-center justify-between">
                <span className="text-[0.73rem] text-foreground/80">
                  {s.desc}
                </span>
                <KbdGroup>
                  {s.primary.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </KbdGroup>
              </div>
            ))}
          </div>

          {/* Coming-soon cards */}
          {others.map((group) => {
            const { dot, title: titleCls } = COLOR_STYLES[group.color];
            return (
              <div
                key={group.id}
                className={cn(
                  "rounded-xl border p-4",
                  COMING_SOON_BG[group.color] ?? "border-border/40 bg-muted/10",
                )}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", dot)} />
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-widest",
                      titleCls,
                    )}
                  >
                    {group.title}
                  </p>
                </div>
                {group.shortcuts.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {group.shortcuts.map((s) => (
                      <div
                        key={s.desc}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[0.72rem] text-foreground/75">
                          {s.desc}
                        </span>
                        <KbdGroup>
                          {s.primary.map((k) => (
                            <Kbd key={k}>{k}</Kbd>
                          ))}
                        </KbdGroup>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.7rem] text-muted-foreground/40">
                    Coming soon
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
