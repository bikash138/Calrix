import ReplyIcon from "@mui/icons-material/Reply";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { cn } from "@/lib/utils";

type MockItem = {
  avatar: string;
  avatarColor: string;
  title: string;
  context: string;
  urgency?: "critical" | "high" | "normal";
  primary: string;
  secondary: string;
};

const REPLY_ITEMS: MockItem[] = [
  {
    avatar: "JL",
    avatarColor: "bg-blue-500",
    title: "Jordan Lee — Q3 budget sign-off",
    context: "Can you confirm the revised numbers by EOD?",
    urgency: "critical",
    primary: "Reply",
    secondary: "Dismiss",
  },
  {
    avatar: "MP",
    avatarColor: "bg-emerald-500",
    title: "Maya Patel — Contract redlines",
    context: "Following up on the changes from Tuesday.",
    urgency: "high",
    primary: "Reply",
    secondary: "Dismiss",
  },
  {
    avatar: "RC",
    avatarColor: "bg-violet-500",
    title: "Raj Chen — Intro to design partner",
    context: "Happy to connect you both — that work?",
    urgency: "normal",
    primary: "Reply",
    secondary: "Dismiss",
  },
];

const APPROVAL_ITEMS: MockItem[] = [
  {
    avatar: "FN",
    avatarColor: "bg-orange-500",
    title: "Finance — Reimbursement $420",
    context: "",
    primary: "Approve",
    secondary: "Reject",
  },
  {
    avatar: "HR",
    avatarColor: "bg-pink-500",
    title: "HR — PTO request, 2 days",
    context: "",
    primary: "Approve",
    secondary: "Reject",
  },
];

const SECTION_META = {
  reply: { icon: <ReplyIcon sx={{ fontSize: 13 }} />, color: "text-rose-500" },
  approval: {
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
    color: "text-amber-500",
  },
} as const;

function CardHeader({
  icon,
  iconColor,
  label,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <span className={cn("flex shrink-0 items-center", iconColor)}>
          {icon}
        </span>
        <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  section,
  compact = false,
}: {
  item: MockItem;
  section: keyof typeof SECTION_META;
  compact?: boolean;
}) {
  const meta = SECTION_META[section];
  const urgencyDot =
    item.urgency === "critical"
      ? "bg-rose-500"
      : item.urgency === "high"
        ? "bg-amber-500"
        : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        compact ? "px-3.5 py-2" : "px-3.5 py-2.5",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full text-[0.5rem] font-bold text-white",
          compact ? "h-5 w-5" : "h-6 w-6",
          item.avatarColor,
        )}
      >
        {item.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {urgencyDot && (
            <span className={cn("h-1 w-1 shrink-0 rounded-full", urgencyDot)} />
          )}
          <span
            className={cn(
              "truncate font-medium text-foreground",
              compact ? "text-[0.72rem]" : "text-[0.78rem]",
            )}
          >
            {item.title}
          </span>
        </div>
        {!compact && item.context && (
          <p className="mt-px truncate text-[0.65rem] italic text-muted-foreground/60">
            {item.context}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[0.63rem] font-medium text-foreground">
          <span className={cn("flex items-center", meta.color)}>
            {meta.icon}
          </span>
          {item.primary}
        </span>
        <span className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[0.63rem] font-medium text-muted-foreground">
          {item.secondary}
        </span>
      </div>
    </div>
  );
}

/**
 * Decorative, non-interactive mock of the Actions triage queue.
 * Mirrors the real Actions page cards (Needs Reply + Needs Approval)
 * with sample data. Sits centered over the workflow tab background.
 */
export default function ActionsMock() {
  return (
    <div className="pointer-events-none w-[94%] max-w-md origin-center scale-[0.95] select-none">
      <div className="flex flex-col gap-3 rounded-[1.75rem] bg-white/40 p-3 shadow-2xl shadow-black/10 ring-1 ring-white/40 backdrop-blur-xl">
        {/* Needs Reply */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
          <CardHeader
            icon={<ReplyIcon sx={{ fontSize: 14 }} />}
            iconColor="text-rose-500"
            label="Needs Reply"
          />
          <div className="divide-y divide-border/40">
            {REPLY_ITEMS.map((item) => (
              <ItemRow key={item.title} item={item} section="reply" />
            ))}
          </div>
        </div>

        {/* Needs Approval */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
          <CardHeader
            icon={<TaskAltIcon sx={{ fontSize: 14 }} />}
            iconColor="text-amber-500"
            label="Needs Approval"
          />
          <div className="divide-y divide-border/40">
            {APPROVAL_ITEMS.map((item) => (
              <ItemRow key={item.title} item={item} section="approval" compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
