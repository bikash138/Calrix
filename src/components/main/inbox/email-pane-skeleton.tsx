import { cn } from "@/lib/utils";

export function EmailPaneSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-5 w-3/4 rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-2.5 w-48 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("h-2.5 rounded bg-muted", i % 3 === 2 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}
