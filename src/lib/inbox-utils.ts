import type { ThreadRow } from "@/lib/api-client/inbox.api";

//Avatar

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-pink-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

//Date formatting

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

//Thread grouping

export type ThreadGroup = { label: string; threads: ThreadRow[] };

export function groupThreads(threads: ThreadRow[]): ThreadGroup[] {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOf7Days = new Date(startOfToday);
  startOf7Days.setDate(startOf7Days.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const today: ThreadRow[] = [],
    yesterday: ThreadRow[] = [],
    last7: ThreadRow[] = [],
    thisMonth: ThreadRow[] = [],
    older: ThreadRow[] = [];

  for (const t of threads) {
    const date = t.date ? new Date(t.date) : new Date(0);
    if (date >= startOfToday) today.push(t);
    else if (date >= startOfYesterday) yesterday.push(t);
    else if (date >= startOf7Days) last7.push(t);
    else if (date >= startOfMonth) thisMonth.push(t);
    else older.push(t);
  }

  return [
    { label: "Today", threads: today },
    { label: "Yesterday", threads: yesterday },
    { label: "Last 7 days", threads: last7 },
    { label: "Earlier this month", threads: thisMonth },
    { label: "Older", threads: older },
  ].filter((g) => g.threads.length > 0);
}
