import {
  Inbox,
  RefreshCw,
  Star,
  Trash2,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SenderAvatar } from "@/components/main/inbox/sender-avatar";
import { LogoMark } from "@/assets/logo";

type Chip = {
  label: string;
  icon: LucideIcon;
  kbd: string;
  active?: boolean;
};

const CHIPS: Chip[] = [
  { label: "All mail", icon: Inbox, kbd: "1", active: true },
  { label: "Unread", icon: RefreshCw, kbd: "2" },
  { label: "Starred", icon: Star, kbd: "3" },
  { label: "Trash", icon: Trash2, kbd: "4" },
];

type MockThread = {
  name: string;
  subject: string;
  snippet: string;
  time: string;
  unread?: boolean;
};

const THREADS: MockThread[] = [
  {
    name: "Rima Kumari Shaw",
    subject: "URGENT: prod db breaks",
    snippet: "the pipeline is down again",
    time: "3:06 AM",
    unread: true,
  },
  {
    name: "Bikash Shaw",
    subject: "Need your sign-off on the contract",
    snippet: "redlines attached for review",
    time: "2:52 AM",
    unread: true,
  },
  {
    name: "vshaw138@gmail.com",
    subject: "Can we meet Thursday at 10 AM?",
    snippet: "to review the Q3 roadmap",
    time: "1:32 AM",
  },
  {
    name: "Anita Shaw",
    subject: "Sign-off required on Acme",
    snippet: "deadline is tomorrow EOD",
    time: "1:02 AM",
    unread: true,
  },
];

function FilterChip({ chip }: { chip: Chip }) {
  const Icon = chip.icon;
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium",
        chip.active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
          : "border-zinc-200 bg-white text-zinc-500",
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          chip.active ? "text-indigo-600" : "text-zinc-400",
        )}
      />
      {chip.label}
      <kbd
        className={cn(
          "ml-0.5 rounded px-1 py-px font-mono text-[9px]",
          chip.active
            ? "bg-indigo-100 text-indigo-500"
            : "bg-zinc-100 text-zinc-400",
        )}
      >
        {chip.kbd}
      </kbd>
    </span>
  );
}

function ThreadItem({ thread }: { thread: MockThread }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 items-center gap-2.5 border-b border-zinc-200 py-2.5 pl-5 pr-3 last:border-b-0",
        thread.unread ? "bg-blue-50" : "bg-white",
      )}
    >
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
        {thread.unread && (
          <span className="block h-1.5 w-1.5 rounded-full bg-blue-500" />
        )}
      </div>

      <SenderAvatar name={thread.name} className="h-7 w-7 text-[10px]" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "truncate text-xs",
              thread.unread ? "font-semibold text-zinc-900" : "text-zinc-500",
            )}
          >
            {thread.name}
          </span>
          <span className="ml-auto shrink-0 text-[10px] text-zinc-400">
            {thread.time}
          </span>
        </div>
        <div className="min-w-0 truncate text-xs text-zinc-500">
          <span className={cn(thread.unread && "font-medium text-zinc-700")}>
            {thread.subject}
          </span>
          {" — "}
          {thread.snippet}
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative, non-interactive mock of the Inbox page.
 * Filter chips on top, email list below — in a glassy rounded card.
 */
export default function InboxMock() {
  return (
    <div className="pointer-events-none w-[96%] max-w-lg select-none">
      <div className="relative rounded-[1.75rem] bg-white/70 p-3 shadow-2xl shadow-black/10 ring-1 ring-white/40 backdrop-blur-xl">
        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-1 pb-3">
          {CHIPS.map((chip) => (
            <FilterChip key={chip.label} chip={chip} />
          ))}
          <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <RotateCw className="h-3 w-3" />
            Refresh
          </span>
        </div>

        {/* Email list */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="px-5 pb-1 pt-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Today
            </span>
          </div>
          {THREADS.map((t) => (
            <ThreadItem key={t.subject} thread={t} />
          ))}
        </div>

        {/* Floating Calrix AI button */}
        <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg shadow-black/15 ring-1 ring-black/5">
          <LogoMark size={24} />
        </div>
      </div>
    </div>
  );
}
