import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/inbox-utils";
import { SenderAvatar } from "./sender-avatar";
import type { ThreadRow as ThreadRowType } from "@/lib/api-client/inbox.api";

export function ThreadRow({
  thread, selected, compact, onSelect, onStar,
}: {
  thread: ThreadRowType;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
  onStar: (ev: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex min-w-0 cursor-pointer items-center gap-2.5 border-b border-border py-3 pr-3 transition-colors",
        compact ? "pl-4" : "pl-5",
        selected ? "bg-accent" : "hover:bg-accent/50",
        thread.unread && !selected && "bg-blue-50/60 dark:bg-blue-950/10",
      )}
    >
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
        {thread.unread && <span className="block h-1.5 w-1.5 rounded-full bg-blue-500" />}
      </div>

      <SenderAvatar
        name={thread.senderName}
        className={cn("text-[10px]", compact ? "h-6 w-6" : "h-7 w-7")}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("truncate text-xs", thread.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {thread.senderName}
            {thread.messageCount > 1 && (
              <span className="ml-1 text-[10px] text-muted-foreground">({thread.messageCount})</span>
            )}
          </span>
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
            {formatTime(thread.date)}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            <span className={cn(thread.unread ? "font-medium text-foreground/90" : "")}>
              {thread.subject}
            </span>
            {" — "}{thread.snippet}
          </span>
          <button
            onClick={onStar}
            className={cn("shrink-0 transition-opacity", thread.starred ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
          >
            <Star className={cn("h-3 w-3", thread.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        </div>
      </div>
    </div>
  );
}
