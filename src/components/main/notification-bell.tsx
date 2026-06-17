"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Reply,
  BadgeCheck,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useUrgentEmails,
  type UrgentNotification,
} from "./urgent-emails-provider";

type CategoryStyle = {
  label: string;
  icon: typeof Reply;
  chip: string;
  iconWrap: string;
  accent: string;
};

const CATEGORY_META: Record<UrgentNotification["category"], CategoryStyle> = {
  reply: {
    label: "Reply",
    icon: Reply,
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    iconWrap: "bg-rose-500/10 text-rose-500",
    accent: "bg-rose-500",
  },
  approval: {
    label: "Approval",
    icon: BadgeCheck,
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconWrap: "bg-amber-500/10 text-amber-500",
    accent: "bg-amber-500",
  },
  meeting: {
    label: "Meeting",
    icon: CalendarClock,
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    iconWrap: "bg-blue-500/10 text-blue-500",
    accent: "bg-blue-500",
  },
};

function senderName(from: string): string {
  return from.replace(/<[^>]*>/, "").trim() || from;
}

function relativeTime(at: number): string {
  const mins = Math.floor((Date.now() - at) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationRow({
  n,
  onClick,
}: {
  n: UrgentNotification;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  const isCritical = n.urgency === "critical";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/40",
        !n.seen && "bg-muted/20",
      )}
    >
      {/* Accent bar for unseen items */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-opacity",
          !n.seen ? meta.accent : "bg-transparent",
        )}
      />
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          meta.iconWrap,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[0.55rem] font-bold uppercase tracking-wide",
              meta.chip,
            )}
          >
            {meta.label}
          </span>
          {isCritical && (
            <span className="flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-px text-[0.55rem] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-2.5" />
              Critical
            </span>
          )}
          <span className="ml-auto shrink-0 text-[0.6rem] text-muted-foreground/50">
            {relativeTime(n.at)}
          </span>
        </div>
        <p className="mt-1 truncate text-[0.78rem] font-semibold text-foreground">
          {n.subject}
        </p>
        <p className="truncate text-[0.66rem] text-muted-foreground">
          {senderName(n.from)}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[0.66rem] leading-snug text-muted-foreground/70">
          {n.aiSummary}
        </p>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unseenCount, markAllSeen } = useUrgentEmails();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) markAllSeen();
  };

  const goToActions = () => {
    router.push("/actions");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          aria-label="Urgent notifications"
          className="relative flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Bell className="size-4" />
          {unseenCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.55rem] font-bold leading-none text-white shadow-sm ring-2 ring-background">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-rose-500/[0.07] via-transparent to-transparent px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/10 text-rose-500">
              <Bell className="size-3" />
            </span>
            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-foreground/80">
              Urgent
            </span>
            {notifications.length > 0 && (
              <span className="rounded-full bg-rose-500/10 px-1.5 py-px text-[0.6rem] font-bold text-rose-600 dark:text-rose-400">
                {notifications.length}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={goToActions}
              className="text-[0.65rem] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              View all
            </button>
          )}
        </div>
        <div className="max-h-80 divide-y divide-border/40 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/40">
                <BellOff className="size-5" />
              </span>
              <p className="text-[0.7rem] font-medium text-muted-foreground/50">
                You&apos;re all caught up
              </p>
              <p className="text-[0.62rem] text-muted-foreground/40">
                Urgent emails will show up here
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow key={n.id} n={n} onClick={goToActions} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
