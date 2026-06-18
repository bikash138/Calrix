import { cn } from "@/lib/utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type Event = { title: string; color: string };

type Day = {
  label: string;
  muted?: boolean;
  today?: boolean;
  events?: Event[];
};

// June 2026 — starts on a Monday, so the grid opens with Sun May 31.
const DAYS: Day[] = [
  // Week 1
  { label: "31", muted: true },
  { label: "1" },
  { label: "2" },
  { label: "3" },
  { label: "4" },
  { label: "5" },
  { label: "6" },
  // Week 2
  { label: "7" },
  { label: "8" },
  { label: "9" },
  { label: "10" },
  { label: "11" },
  { label: "12" },
  { label: "13" },
  // Week 3
  { label: "14" },
  { label: "15" },
  { label: "16", events: [{ title: "Product demo", color: "bg-cyan-600" }] },
  {
    label: "17",
    events: [
      { title: "1:1 with Priya", color: "bg-violet-600" },
      { title: "Review PRs", color: "bg-blue-600" },
    ],
  },
  { label: "18", today: true, events: [{ title: "Standup", color: "bg-emerald-600" }] },
  { label: "19", events: [{ title: "Design sync", color: "bg-pink-600" }] },
  { label: "20" },
  // Week 4
  { label: "21", events: [{ title: "Yoga class", color: "bg-amber-600" }] },
  {
    label: "22",
    events: [
      { title: "Sprint planning", color: "bg-blue-600" },
      { title: "Lunch with Sam", color: "bg-amber-600" },
    ],
  },
  {
    label: "23",
    events: [
      { title: "Investor call", color: "bg-rose-600" },
      { title: "Dinner w/ Maya", color: "bg-violet-600" },
    ],
  },
  { label: "24", events: [{ title: "Roadmap review", color: "bg-cyan-600" }] },
  { label: "25" },
  { label: "26", events: [{ title: "Release v2.0", color: "bg-emerald-600" }] },
  { label: "27" },
  // Week 5
  { label: "28" },
  { label: "29" },
  { label: "30" },
  { label: "1", muted: true },
  { label: "2", muted: true },
  { label: "3", muted: true },
  { label: "4", muted: true },
];

function EventPill({ event }: { event: Event }) {
  return (
    <div
      className={cn(
        "truncate rounded-sm px-1 py-px text-[8px] font-medium leading-tight text-white",
        event.color,
      )}
    >
      {event.title}
    </div>
  );
}

/**
 * Decorative, non-interactive mock of the Calendar month view.
 * Sits centered over the workflow tab background.
 */
export default function CalendarMock() {
  return (
    <div className="pointer-events-none relative z-10 w-[97%] select-none">
      <div className="overflow-hidden rounded-2xl bg-white/70 shadow-2xl shadow-black/10 ring-1 ring-white/40 backdrop-blur-xl">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-zinc-200">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 text-center text-[9px] font-semibold tracking-widest text-zinc-400"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {DAYS.map((day, i) => (
            <div
              key={i}
              className={cn(
                "min-h-[52px] border-b border-r border-zinc-200/70 p-1",
                i % 7 === 6 && "border-r-0",
                day.today && "bg-zinc-100/60",
              )}
            >
              <div className="mb-1 text-right">
                <span
                  className={cn(
                    "text-[9px]",
                    day.muted
                      ? "text-zinc-300"
                      : day.today
                        ? "font-bold text-zinc-900"
                        : "text-zinc-400",
                  )}
                >
                  {day.label}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {day.events?.map((ev) => (
                  <EventPill key={ev.title} event={ev} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
