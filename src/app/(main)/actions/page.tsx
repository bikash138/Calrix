"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useActionsCount, type UIActionItem, type SectionId } from "@/components/actions-count-provider";
import { ActionReplyModal } from "@/components/main/actions/action-reply-modal";
import { useTriageSync } from "@/hooks/use-triage-sync";
import { useCalendarEvents } from "@/hooks/use-calendar";
import type { CalendarEvent } from "@/server/module/calendar/calendar-events.schema";
import { useUserStore } from "@/store/user.store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReplyIcon from "@mui/icons-material/Reply";
import EventIcon from "@mui/icons-material/Event";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

type ActionItem = UIActionItem;

type TodayMeeting = {
  id: string;
  avatar: string;
  avatarColor: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  isPast: boolean;
};

// ── Calendar event → Today's-meeting mapping ─────────────────────
const MEETING_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-orange-500", "bg-pink-500", "bg-amber-500", "bg-cyan-500",
];

function colorFor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return MEETING_COLORS[Math.abs(h) % MEETING_COLORS.length]!;
}

function initialsOf(s: string): string {
  return s.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtDuration(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function meetingFromEvent(e: CalendarEvent): TodayMeeting {
  return {
    id: e.id,
    avatar: initialsOf(e.title),
    avatarColor: colorFor(e.title),
    title: e.title,
    time: fmtTime(e.start),
    duration: fmtDuration(e.start, e.end),
    location: e.location ?? "No location",
    isPast: new Date(e.end).getTime() < Date.now(),
  };
}

// ── Bento card ───────────────────────────────────────────────────
function BentoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card", className)}>
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  iconColor,
  label,
  count,
  bulkLabel,
  onBulk,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  count: number;
  bulkLabel?: string;
  onBulk?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <span className={cn("shrink-0 flex items-center", iconColor)}>{icon}</span>
        <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="rounded-full bg-muted px-1.5 py-px text-[0.6rem] font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
      {bulkLabel && onBulk && count > 0 && (
        <button
          onClick={onBulk}
          className="text-[0.65rem] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          {bulkLabel}
        </button>
      )}
    </div>
  );
}

// Primary-action icon + accent tint per section.
const SECTION_META: Record<SectionId, { icon: React.ReactNode; color: string }> = {
  reply:    { icon: <ReplyIcon sx={{ fontSize: 13 }} />,                       color: "text-rose-500" },
  approval: { icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,                 color: "text-amber-500" },
  meeting:  { icon: <EventIcon sx={{ fontSize: 13 }} />,                       color: "text-blue-500" },
  waiting:  { icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 13 }} />, color: "text-violet-500" },
  overdue:  { icon: <SendOutlinedIcon sx={{ fontSize: 13 }} />,                color: "text-zinc-500" },
};

function ItemRow({
  item,
  onPrimary,
  onSecondary,
  compact = false,
}: {
  item: ActionItem;
  onPrimary: () => void;
  onSecondary?: () => void;
  compact?: boolean;
}) {
  const meta = SECTION_META[item.section];
  const urgencyDot =
    item.urgency === "critical"
      ? "bg-rose-500"
      : item.urgency === "high"
      ? "bg-amber-500"
      : null;

  return (
    <div className={cn(
      "flex items-center gap-2.5 transition-colors hover:bg-muted/20",
      compact ? "px-3.5 py-2" : "px-3.5 py-2.5"
    )}>
      <div className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[0.5rem] font-bold text-white",
        compact ? "h-5 w-5" : "h-6 w-6",
        item.avatarColor
      )}>
        {item.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {urgencyDot && <span className={cn("h-1 w-1 shrink-0 rounded-full", urgencyDot)} />}
          <span className={cn("truncate font-medium text-foreground", compact ? "text-[0.72rem]" : "text-[0.78rem]")}>
            {item.title}
          </span>
        </div>
        {!compact && (
          <p className="mt-px truncate text-[0.65rem] italic text-muted-foreground/60">
            {item.context}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onPrimary}
          className="flex cursor-pointer items-center gap-1 rounded-md border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[0.63rem] font-medium text-foreground transition-all duration-150 hover:-translate-y-px hover:border-foreground/25 hover:bg-foreground/10"
        >
          <span className={cn("flex items-center", meta.color)}>{meta.icon}</span>
          {item.primary}
        </button>
        {item.secondary && onSecondary && (
          <button
            onClick={onSecondary}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[0.63rem] font-medium text-muted-foreground transition-all duration-150 hover:-translate-y-px hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            {item.secondary}
          </button>
        )}
      </div>
    </div>
  );
}

function TodayMeetingRow({ meeting }: { meeting: TodayMeeting }) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-muted/20",
      meeting.isPast && "opacity-50"
    )}>
      <div className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-bold text-white",
        meeting.avatarColor
      )}>
        {meeting.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <span className={cn(
          "truncate text-[0.78rem] font-medium text-foreground block",
          meeting.isPast && "line-through"
        )}>
          {meeting.title}
        </span>
        <p className="mt-px truncate text-[0.65rem] text-muted-foreground/60">
          {meeting.time} · {meeting.duration} · {meeting.location}
        </p>
      </div>
    </div>
  );
}

// ── Empty card state ─────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-6">
      <p className="text-[0.68rem] text-muted-foreground/40">{label}</p>
    </div>
  );
}

// ── Meeting card with tabs ────────────────────────────────────────
function MeetingCard({
  requests,
  onAccept,
  onDecline,
  onAcceptAll,
}: {
  requests: ActionItem[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onAcceptAll: () => void;
}) {
  const [tab, setTab] = useState<"today" | "requests">("today");

  // Today's window (memoized so the query key stays stable across renders).
  const { todayMin, todayMax } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { todayMin: start.toISOString(), todayMax: end.toISOString() };
  }, []);

  const { events, isPending } = useCalendarEvents(todayMin, todayMax);
  const todaysMeetings = useMemo(
    () => events.filter((e) => !e.allDay).map(meetingFromEvent),
    [events],
  );

  return (
    <BentoCard className="col-span-1 row-span-2">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="shrink-0 flex items-center text-blue-500">
            <EventIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Meetings
          </span>
        </div>
        {tab === "requests" && requests.length > 0 && (
          <button
            onClick={onAcceptAll}
            className="text-[0.65rem] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            Accept all
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-border/40 px-3.5">
        {(["today", "requests"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative pb-1.5 pt-2 text-[0.65rem] font-medium transition-colors mr-4",
              tab === t
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            {t === "today" ? "Today's Meetings" : "Requests"}
            {t === "requests" && requests.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1 py-px text-[0.55rem] font-semibold text-muted-foreground">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {tab === "today" ? (
          isPending ? (
            <EmptyState label="Loading…" />
          ) : todaysMeetings.length > 0 ? (
            todaysMeetings.map((m) => (
              <TodayMeetingRow key={m.id} meeting={m} />
            ))
          ) : (
            <EmptyState label="No meetings today" />
          )
        ) : requests.length > 0 ? (
          requests.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onPrimary={() => onAccept(item.id)}
              onSecondary={() => onDecline(item.id)}
            />
          ))
        ) : (
          <EmptyState label="No pending invites" />
        )}
      </div>
    </BentoCard>
  );
}

// ── Sync button ──────────────────────────────────────────────────
function SyncButton() {
  const userId = useUserStore((s) => s.id);
  const { sync, status, phase, remaining, resetInMs } = useTriageSync(userId);
  const syncing = status === "syncing";
  const exhausted = remaining === 0;

  const label =
    status === "syncing"
      ? phase ?? "Syncing…"
      : status === "synced"
      ? "Synced"
      : status === "error"
      ? "Retry"
      : "Sync Actions";

  const tooltipText = exhausted
    ? `No syncs left · resets in ${Math.ceil(resetInMs / 60_000)} min`
    : `${remaining} sync${remaining === 1 ? "" : "s"} left this hour`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
          <button
            onClick={sync}
            disabled={syncing || exhausted}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.7rem] font-medium transition-all duration-150 hover:-translate-y-px",
              status === "error"
                ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                : status === "synced"
                ? "border-emerald-300 text-emerald-600"
                : exhausted
                ? "border-border cursor-not-allowed opacity-40 hover:translate-y-0"
                : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              syncing && "cursor-not-allowed opacity-80 hover:translate-y-0",
            )}
          >
            {status === "synced" ? (
              <CheckCircleIcon sx={{ fontSize: 14 }} />
            ) : status === "error" ? (
              <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            ) : (
              <SyncIcon sx={{ fontSize: 14 }} className={cn(syncing && "animate-spin")} />
            )}
            <span>{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltipText}</TooltipContent>
      </Tooltip>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function ActionsPage() {
  const { items, dismiss, removeLocal } = useActionsCount();
  const [active, setActive] = useState<ActionItem | null>(null);

  const bySection = (section: SectionId) => items.filter((i) => i.section === section);

  const reply    = bySection("reply");
  const approval = bySection("approval");
  const meeting  = bySection("meeting");
  const waiting  = bySection("waiting");
  const overdue  = bySection("overdue");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ActionReplyModal
        key={active?.id ?? "none"}
        item={active}
        onClose={() => setActive(null)}
        onSent={(id) => {
          removeLocal(id);
          setActive(null);
        }}
      />

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
          Actions
        </span>
        <SyncButton />
      </div>

      {/* ── Bento grid ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid h-full grid-cols-3 grid-rows-[auto_auto] gap-3">

          {/* ── Needs Reply (large, col-span-2 row-span-2) ───────── */}
          <BentoCard className="col-span-2 row-span-2">
            <CardHeader icon={<ReplyIcon sx={{ fontSize: 14 }} />} iconColor="text-rose-500" label="Needs Reply" count={reply.length} />
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {reply.length > 0
                ? reply.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onPrimary={() => setActive(item)}
                      onSecondary={() => dismiss(item.id)}
                    />
                  ))
                : <EmptyState label="No replies needed" />
              }
            </div>
          </BentoCard>

          {/* ── Meetings (tabbed) ─────────────────────────────────── */}
          <MeetingCard
            requests={meeting}
            onAccept={(id) => setActive(meeting.find((m) => m.id === id) ?? null)}
            onDecline={(id) => dismiss(id)}
            onAcceptAll={() => dismiss(...meeting.map((i) => i.id))}
          />

          {/* ── Needs Approval ───────────────────────────────────── */}
          <BentoCard className="col-span-1">
            <CardHeader
              icon={<TaskAltIcon sx={{ fontSize: 14 }} />}
              iconColor="text-amber-500"
              label="Needs Approval"
              count={approval.length}
              bulkLabel="Approve all"
              onBulk={() => dismiss(...approval.map((i) => i.id))}
            />
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {approval.length > 0
                ? approval.map((item) => (
                    <ItemRow key={item.id} item={item} compact
                      onPrimary={() => setActive(item)}
                      onSecondary={() => dismiss(item.id)}
                    />
                  ))
                : <EmptyState label="Nothing to approve" />
              }
            </div>
          </BentoCard>

          {/* ── Waiting For Response ─────────────────────────────── */}
          <BentoCard className="col-span-1">
            <CardHeader icon={<HourglassEmptyIcon sx={{ fontSize: 14 }} />} iconColor="text-violet-500" label="Waiting For Response" count={waiting.length} />
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {waiting.length > 0
                ? waiting.map((item) => (
                    <ItemRow key={item.id} item={item} compact
                      onPrimary={() => setActive(item)}
                      onSecondary={() => dismiss(item.id)}
                    />
                  ))
                : <EmptyState label="Nothing waiting" />
              }
            </div>
          </BentoCard>

          {/* ── Overdue Follow-Ups ───────────────────────────────── */}
          <BentoCard className="col-span-1">
            <CardHeader icon={<AccessAlarmIcon sx={{ fontSize: 14 }} />} iconColor="text-zinc-400" label="Overdue Follow-Ups" count={overdue.length} />
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {overdue.length > 0
                ? overdue.map((item) => (
                    <ItemRow key={item.id} item={item} compact
                      onPrimary={() => setActive(item)}
                      onSecondary={() => dismiss(item.id)}
                    />
                  ))
                : <EmptyState label="No overdue items" />
              }
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}
