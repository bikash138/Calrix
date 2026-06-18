"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-md border border-border bg-muted/30 p-[3px] gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-2.5 py-1 text-[0.7rem] font-medium transition-colors cursor-pointer",
            value === opt
              ? "bg-card text-foreground shadow-sm border border-border rounded-sm"
              : "text-muted-foreground hover:text-foreground rounded-sm",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function Row({
  label,
  description,
  children,
  last = false,
}: {
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 py-3.5",
        !last && "border-b border-border/60",
      )}
    >
      <div className="min-w-0">
        <p className="text-[0.8rem] font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4">
      {children}
    </div>
  );
}

export function Group({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {title && (
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {title}
        </p>
      )}
      <Card>{children}</Card>
    </div>
  );
}
