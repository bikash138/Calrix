import Image from "next/image";
import backgroundImg from "@/assets/landing/background-image.png";
import { cn } from "@/lib/utils";
import {
  LogOut,
  ArrowRight,
  ArrowDown,
  PanelLeft,
  LayoutDashboard,
  Zap,
  Inbox,
  Calendar,
  Settings,
  User,
  Sparkles,
  Keyboard,
  Sun,
} from "lucide-react";

// Mock data

type Item = {
  avatar: string;
  color: string;
  title: string;
  context: string;
  primary: string;
  secondary?: string;
  urgency?: "critical" | "high";
};

const REPLY: Item[] = [
  {
    avatar: "SJ",
    color: "bg-rose-500",
    urgency: "critical",
    title: "Q3 Strategy Deck — Final Review Needed",
    context: "Waiting on your sign-off before the board meeting Friday.",
    primary: "Reply",
    secondary: "Later",
  },
  {
    avatar: "MC",
    color: "bg-blue-500",
    urgency: "high",
    title: "Partnership proposal — Acme Corp",
    context: "They want a response by EOD or they'll go with a competitor.",
    primary: "Reply",
    secondary: "Later",
  },
  {
    avatar: "DP",
    color: "bg-amber-500",
    urgency: "high",
    title: "Budget approval for new hires",
    context: "Need your go-ahead to send offers to 3 candidates.",
    primary: "Reply",
    secondary: "Later",
  },
  {
    avatar: "PN",
    color: "bg-emerald-500",
    title: "Team offsite — dates confirmed?",
    context: "Checking if last week of August works for everyone.",
    primary: "Reply",
    secondary: "Later",
  },
  {
    avatar: "LK",
    color: "bg-violet-500",
    title: "Re: Updated contract terms",
    context: "Legal made a few edits — wants your thoughts before signing.",
    primary: "Reply",
    secondary: "Later",
  },
];

const MEETINGS_TODAY = [
  {
    avatar: "SJ",
    color: "bg-rose-500",
    title: "Design review",
    time: "10:00 am",
    duration: "30 min",
    location: "Google Meet",
  },
  {
    avatar: "MC",
    color: "bg-blue-500",
    title: "Weekly sync",
    time: "12:30 pm",
    duration: "1 hr",
    location: "Zoom",
  },
  {
    avatar: "AT",
    color: "bg-cyan-500",
    title: "Investor call",
    time: "3:00 pm",
    duration: "45 min",
    location: "Phone",
  },
];

const APPROVAL: Item[] = [
  {
    avatar: "TW",
    color: "bg-amber-500",
    title: "Vendor contract — $12k/yr",
    context: "",
    primary: "Approve",
    secondary: "Reject",
  },
  {
    avatar: "AS",
    color: "bg-pink-500",
    title: "Design system update PR",
    context: "",
    primary: "Approve",
    secondary: "Reject",
  },
  {
    avatar: "NR",
    color: "bg-lime-600",
    title: "Expense report — $840",
    context: "",
    primary: "Approve",
    secondary: "Reject",
  },
];

const WAITING: Item[] = [
  {
    avatar: "BC",
    color: "bg-violet-500",
    title: "Proposal sent 3 days ago",
    context: "",
    primary: "Nudge",
  },
  {
    avatar: "MZ",
    color: "bg-cyan-500",
    title: "Invoice follow-up — $3,200",
    context: "",
    primary: "Nudge",
  },
  {
    avatar: "JL",
    color: "bg-emerald-500",
    title: "Contract sent last Tuesday",
    context: "",
    primary: "Nudge",
  },
];

const OVERDUE: Item[] = [
  {
    avatar: "JR",
    color: "bg-zinc-500",
    title: "Intro call never happened",
    context: "",
    primary: "Follow Up",
    secondary: "Dismiss",
  },
  {
    avatar: "OM",
    color: "bg-rose-500",
    title: "Demo scheduled last month",
    context: "",
    primary: "Follow Up",
    secondary: "Dismiss",
  },
  {
    avatar: "KP",
    color: "bg-blue-500",
    title: "Onboarding check-in overdue",
    context: "",
    primary: "Follow Up",
    secondary: "Dismiss",
  },
];

// Primitives

function Avatar({
  label,
  color,
  size = "md",
}: {
  label: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        color,
        size === "sm" ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[9px]",
      )}
    >
      {label}
    </div>
  );
}

function ActionBtn({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "rounded px-2 py-0.5 text-[9px] font-medium",
        variant === "primary"
          ? "border border-foreground/15 bg-foreground/5 text-foreground"
          : "border border-border text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

function ItemRow({ item, compact }: { item: Item; compact?: boolean }) {
  const dot =
    item.urgency === "critical"
      ? "bg-rose-500"
      : item.urgency === "high"
        ? "bg-amber-500"
        : null;
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact ? "px-3 py-1.5" : "px-3 py-2",
      )}
    >
      <Avatar
        label={item.avatar}
        color={item.color}
        size={compact ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {dot && (
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
          )}
          <span
            className={cn(
              "truncate font-medium text-foreground",
              compact ? "text-[9px]" : "text-[10px]",
            )}
          >
            {item.title}
          </span>
        </div>
        {!compact && item.context && (
          <p className="truncate text-[8px] italic text-muted-foreground/60">
            {item.context}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <ActionBtn label={item.primary} />
        {item.secondary && (
          <ActionBtn label={item.secondary} variant="secondary" />
        )}
      </div>
    </div>
  );
}

function CardHeader({
  icon,
  iconColor,
  label,
}: {
  icon: string;
  iconColor: string;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2">
      <span className={cn("text-[11px]", iconColor)}>{icon}</span>
      <span className="text-[8.5px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function BentoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-black/8 bg-white/40 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Sidebar

const NAV_ITEMS = [
  { label: "Chat", Icon: () => <LayoutDashboard className="h-3 w-3" /> },
  { label: "Actions", Icon: () => <Zap className="h-3 w-3" /> },
  { label: "Inbox", Icon: () => <Inbox className="h-3 w-3" /> },
  {
    label: "Calendar",
    Icon: () => <Calendar className="h-3 w-3" />,
    expandable: true,
  },
  {
    label: "Settings",
    Icon: () => <Settings className="h-3 w-3" />,
    expandable: true,
  },
];

const SETTINGS_SUB = [
  { label: "Account", Icon: () => <User className="h-2.5 w-2.5" /> },
  { label: "Inbox", Icon: () => <Inbox className="h-2.5 w-2.5" /> },
  { label: "Calendar", Icon: () => <Calendar className="h-2.5 w-2.5" /> },
  { label: "Calrix AI", Icon: () => <Sparkles className="h-2.5 w-2.5" /> },
  { label: "Shortcuts", Icon: () => <Keyboard className="h-2.5 w-2.5" /> },
];

function Sidebar() {
  return (
    <div className="flex w-[160px] shrink-0 flex-col border-r border-black/8 bg-white/30 py-1 backdrop-blur-sm">
      {/* User row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-primary-foreground">
          B
        </div>
        <span className="truncate text-[10px] font-medium text-foreground">
          Bikash Shaw
        </span>
        <span className="ml-auto text-[8px] tabular-nums text-muted-foreground">
          2:38 AM
        </span>
      </div>

      <div className="mt-1 flex-1 px-1.5">
        {NAV_ITEMS.map(({ label, Icon, expandable }) => (
          <div key={label}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium",
                label === "Actions"
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground",
              )}
            >
              <Icon />
              <span>{label}</span>
              {expandable && (
                <span className="ml-auto opacity-40">
                  {label === "Settings" ? (
                    <ArrowDown className="h-2 w-2" />
                  ) : (
                    <ArrowRight className="h-2 w-2" />
                  )}
                </span>
              )}
            </div>
            {label === "Settings" && (
              <div className="ml-5 mt-0.5 mb-1">
                {SETTINGS_SUB.map(({ label: s, Icon: SIcon }) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 px-1.5 py-1 text-[9px] text-muted-foreground"
                  >
                    <SIcon />
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 px-1.5 pt-1">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground">
          <Sun className="h-3 w-3" />
          Dark mode
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-rose-500">
          <LogOut className="h-3 w-3" />
          Sign out
        </div>
      </div>
    </div>
  );
}

// Top bar

function TopBar() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-black/8 bg-white/30 px-3 py-1.5 backdrop-blur-sm">
      <PanelLeft className="h-3.5 w-3.5 text-muted-foreground/50" />
      <Image
        src="/icon.svg"
        alt="Calrix"
        width={14}
        height={14}
        className="rounded-[3px]"
      />
      <span className="text-[10px] font-semibold text-foreground">Calrix</span>
      <div className="ml-auto flex items-center gap-1.5 rounded-md border border-orange-200/60 bg-linear-to-br from-orange-100/60 to-white/60 px-2 py-1">
        <Image
          src="/icon.svg"
          alt=""
          width={11}
          height={11}
          className="rounded-[2px]"
        />
        <span className="text-[9px] text-black/70">Calrix AI</span>
        <span className="text-[8.5px] font-medium text-black/60">⌘K</span>
      </div>
    </div>
  );
}

// Main mock

export function HeroMock() {
  return (
    <div
      className="flex h-full w-full overflow-hidden rounded-[22px]"
      style={{
        backgroundImage: `url('${backgroundImg.src}')`,
        backgroundSize: "cover",
        backgroundPosition: "center 90%",
      }}
    >
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-black/8">
        <TopBar />

        {/* Bento grid */}
        <div className="flex-1 overflow-hidden p-2">
          <div
            className="grid h-full grid-cols-3 gap-2"
            style={{ gridTemplateRows: "1fr 1fr 1.4fr" }}
          >
            {/* Needs Reply — col-span-2 row-span-2 */}
            <BentoCard className="col-span-2 row-span-2">
              <CardHeader
                icon="↩"
                iconColor="text-rose-500"
                label="Needs Reply"
              />
              <div className="flex-1 divide-y divide-border/40 overflow-hidden">
                {REPLY.map((item) => (
                  <ItemRow key={item.title} item={item} />
                ))}
              </div>
            </BentoCard>

            {/* Meetings */}
            <BentoCard className="col-span-1 row-span-2">
              <div className="flex shrink-0 items-center border-b border-border/60 px-3 py-2">
                <span className="text-[11px] text-blue-500">▦</span>
                <span className="ml-2 text-[8.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Meetings
                </span>
              </div>
              <div className="flex shrink-0 border-b border-border/40 px-3">
                {["Today's Meetings", "Requests"].map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "mr-4 pb-1.5 pt-2 text-[8.5px] font-medium",
                      i === 0
                        ? "border-b border-foreground text-foreground"
                        : "text-muted-foreground/50",
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex-1 divide-y divide-border/40 overflow-hidden">
                {MEETINGS_TODAY.map((m) => (
                  <div
                    key={m.title}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <Avatar label={m.avatar} color={m.color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[9.5px] font-medium text-foreground">
                        {m.title}
                      </span>
                      <p className="text-[7.5px] text-muted-foreground/60">
                        {m.time} · {m.duration} · {m.location}
                      </p>
                    </div>
                    <ActionBtn label="Reschedule" variant="secondary" />
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Needs Approval */}
            <BentoCard>
              <CardHeader
                icon="✓"
                iconColor="text-amber-500"
                label="Needs Approval"
              />
              <div className="flex-1 divide-y divide-border/40 overflow-hidden">
                {APPROVAL.map((item) => (
                  <ItemRow key={item.title} item={item} compact />
                ))}
              </div>
            </BentoCard>

            {/* Waiting */}
            <BentoCard>
              <CardHeader
                icon="⏳"
                iconColor="text-violet-500"
                label="Waiting For Response"
              />
              <div className="flex-1 divide-y divide-border/40 overflow-hidden">
                {WAITING.map((item) => (
                  <ItemRow key={item.title} item={item} compact />
                ))}
              </div>
            </BentoCard>

            {/* Overdue */}
            <BentoCard>
              <CardHeader
                icon="⏰"
                iconColor="text-zinc-400"
                label="Overdue Follow-Ups"
              />
              <div className="flex-1 divide-y divide-border/40 overflow-hidden">
                {OVERDUE.map((item) => (
                  <ItemRow key={item.title} item={item} compact />
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
