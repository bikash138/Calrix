"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "month",  label: "Month" },
  { id: "week",   label: "Week" },
  { id: "day",    label: "Day" },
  { id: "agenda", label: "Agenda" },
];

export function CalendarViewSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "week";

  function setView(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", id);
    router.push(`/calendar?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5 px-2">
      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={cn(
            "flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            view === id
              ? "border-foreground/30 bg-accent text-foreground"
              : "border-border text-muted-foreground hover:text-foreground/70 dark:border-white/10"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
