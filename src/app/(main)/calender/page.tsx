"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import {
  format,
  parse,
  getDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  subDays,
  isSameDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Users,
  ExternalLink,
  Share2,
  FileText,
  X,
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";
import { usePreferencesStore } from "@/store/preferences.store";
import { useCalendarEvents } from "@/hooks/use-calendar";
import type { CalendarEvent } from "@/lib/api-client/calendar.api";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-overrides.css";

// ── RBC event shape ───────────────────────────────────────────────────────────

type RBCEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: CalendarEvent;
};

function toRBCEvent(e: CalendarEvent): RBCEvent {
  return {
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: e.allDay,
    resource: e,
  };
}

// ── Range computation (drives the API query key) ──────────────────────────────

function getRange(date: Date, view: View, weekStartsOn: 0 | 1) {
  const opts = { weekStartsOn } as const;
  if (view === "day") {
    return {
      timeMin: startOfDay(date).toISOString(),
      timeMax: endOfDay(date).toISOString(),
    };
  }
  if (view === "week") {
    return {
      timeMin: startOfDay(startOfWeek(date, opts)).toISOString(),
      timeMax: endOfDay(endOfWeek(date, opts)).toISOString(),
    };
  }
  // month / agenda — cover the full 6-week grid RBC renders
  return {
    timeMin: startOfDay(startOfWeek(startOfMonth(date), opts)).toISOString(),
    timeMax: endOfDay(endOfWeek(endOfMonth(date), opts)).toISOString(),
  };
}

// ── Header label ──────────────────────────────────────────────────────────────

function getLabel(date: Date, view: string, weekStartsOn: 0 | 1): string {
  switch (view) {
    case "month":
      return format(date, "MMMM yyyy");
    case "week": {
      const s = startOfWeek(date, { weekStartsOn });
      const e = endOfWeek(date, { weekStartsOn });
      return s.getMonth() === e.getMonth()
        ? `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`
        : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
    default:
      return format(date, "MMMM yyyy");
  }
}

// ── Navigation helper ─────────────────────────────────────────────────────────

function go(date: Date, view: string, dir: "prev" | "next" | "today"): Date {
  if (dir === "today") return new Date();
  const fwd = dir === "next";
  if (view === "month" || view === "agenda")
    return fwd ? addMonths(date, 1) : subMonths(date, 1);
  if (view === "week") return fwd ? addWeeks(date, 1) : subWeeks(date, 1);
  return fwd ? addDays(date, 1) : subDays(date, 1);
}

// ── Parse "09:00" → Date (for RBC min/max) ───────────────────────────────────

function parseWorkTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
}

// ── RSVP icon ─────────────────────────────────────────────────────────────────

function RsvpIcon({ status }: { status: string }) {
  if (status === "accepted")
    return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  if (status === "declined")
    return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ── Google Calendar color palette ────────────────────────────────────────────

const GCAL_COLOR: Record<string, string> = {
  "1": "bg-[#7986cb]", // lavender
  "2": "bg-[#33b679]", // sage
  "3": "bg-[#8e24aa]", // grape
  "4": "bg-[#e67c73]", // flamingo
  "5": "bg-[#f6bf26]", // banana
  "6": "bg-[#f4511e]", // tangerine
  "7": "bg-[#039be5]", // peacock
  "8": "bg-[#3f51b5]", // blueberry
  "9": "bg-[#0b8043]", // basil
  "10": "bg-[#d50000]", // tomato
  "11": "bg-[#e67c73]", // flamingo alt
};

// ── Event detail dialog ───────────────────────────────────────────────────────

function EventDetailPopover({
  event,
  anchorRect,
  onClose,
}: {
  event: CalendarEvent | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
}) {
  const formatRange = (e: CalendarEvent) => {
    const s = new Date(e.start);
    const end = new Date(e.end);
    if (e.allDay) {
      return isSameDay(s, end)
        ? format(s, "EEEE, MMMM d, yyyy")
        : `${format(s, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    const timeRange = `${format(s, "h:mm")} – ${format(end, "h:mm a").toLowerCase()}`;
    return isSameDay(s, end)
      ? `${format(s, "EEEE, MMMM d")} · ${timeRange}`
      : `${format(s, "MMM d, h:mm a")} – ${format(end, "MMM d, h:mm a, yyyy")}`;
  };

  const dotColor = event?.colorId
    ? (GCAL_COLOR[event.colorId] ?? "bg-blue-500")
    : "bg-blue-500";

  return (
    <Popover open={!!event} onOpenChange={(v) => !v && onClose()}>
      {/* Virtual anchor — a zero-size fixed div at the clicked event's position */}
      <PopoverAnchor asChild>
        <div
          style={{
            position: "fixed",
            left: anchorRect?.left ?? 0,
            top: anchorRect?.top ?? 0,
            width: anchorRect?.width ?? 0,
            height: anchorRect?.height ?? 0,
            pointerEvents: "none",
          }}
        />
      </PopoverAnchor>

      <PopoverContent
        side="right"
        align="start"
        className="w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {event && (
          <>
            {/* Action bar */}
            <div className="flex items-center justify-end gap-0.5 px-2 pt-2">
              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Calendar"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
              {/* Color dot + title */}
              <div className="flex items-start gap-3">
                <div
                  className={cn("mt-1.5 h-3 w-3 shrink-0 rounded-sm", dotColor)}
                />
                <h3 className="font-heading text-base font-semibold leading-snug">
                  {event.title}
                </h3>
              </div>

              {/* Date / time */}
              <p className="ml-6 text-xs text-muted-foreground">
                {formatRange(event)}
              </p>

              {/* Open in GCal pill */}
              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Share2 className="h-3 w-3" />
                  Open in Google Calendar
                </a>
              )}

              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-3 text-xs">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3 text-xs">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              )}

              {/* Attendees */}
              {event.attendees.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <ul className="flex flex-col gap-1.5">
                    {event.attendees.map((a) => (
                      <li
                        key={a.email}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <RsvpIcon status={a.status} />
                        <span className="truncate">
                          {a.name ?? a.email}
                          {a.self && (
                            <span className="ml-1 text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Organizer */}
              {event.organizer?.email && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.organizer.name ?? event.organizer.email}</span>
                </div>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Page content ──────────────────────────────────────────────────────────────

function CalendarContent() {
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") ?? "week") as View;
  const [date, setDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const {
    weekStartsOn: weekStartsOnPref,
    workdayStart,
    workdayEnd,
  } = usePreferencesStore();

  const weekStartsOn: 0 | 1 = weekStartsOnPref === "monday" ? 1 : 0;

  // Recreate localizer only when weekStartsOn changes
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn }),
        getDay,
        locales: { "en-US": enUS },
      }),

    [weekStartsOn],
  );

  // Range is derived from date + view — no separate state needed
  const range = useMemo(
    () => getRange(date, view, weekStartsOn),
    [date, view, weekStartsOn],
  );
  const { events, isPending } = useCalendarEvents(range.timeMin, range.timeMax);
  const rbcEvents = useMemo(() => events.map(toRBCEvent), [events]);

  const minTime = useMemo(() => parseWorkTime(workdayStart), [workdayStart]);
  const maxTime = useMemo(() => parseWorkTime(workdayEnd), [workdayEnd]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Nav header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2">
        <button
          onClick={() => setDate(go(date, view, "today"))}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Today
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setDate(go(date, view, "prev"))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDate(go(date, view, "next"))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm font-medium">
          {getLabel(date, view, weekStartsOn)}
        </span>
        {isPending && (
          <span className="ml-auto animate-pulse text-xs text-muted-foreground">
            Loading…
          </span>
        )}
      </div>

      {/* Calendar */}
      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <Calendar<RBCEvent>
          localizer={localizer}
          events={rbcEvents}
          date={date}
          view={view}
          onNavigate={setDate}
          onView={() => {}}
          onSelectEvent={(e, domEvent) => {
            const rect = (
              domEvent.currentTarget as HTMLElement
            ).getBoundingClientRect();
            setAnchorRect(rect);
            setSelectedEvent(e.resource);
          }}
          toolbar={false}
          selectable={false}
          style={{ height: "100%" }}
          min={minTime}
          max={maxTime}
          formats={{
            timeGutterFormat: "h a",
            dayFormat: "EEE d",
            dayHeaderFormat: "EEEE, MMMM d",
            agendaDateFormat: "EEE, MMM d",
            agendaTimeFormat: "h:mm a",
          }}
        />
      </div>

      <EventDetailPopover
        event={selectedEvent}
        anchorRect={anchorRect}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarContent />
    </Suspense>
  );
}
