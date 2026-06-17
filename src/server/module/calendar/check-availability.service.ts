import {
  DEFAULT_TIMEZONE,
  type CalendarSettings,
  type MeetingBuffer,
} from "@/server/db/schema/settings";
import { listCalendarEvents } from "./list-calendar-events.service";

export type Slot = { start: string; end: string }; // ISO instants

export type AvailabilityResult = {
  isFree: boolean;
  conflicts: { title: string; start: string; end: string }[];
  suggestedSlots: Slot[]; // up to 3 alternatives when not free
};

type Busy = { title: string; start: number; end: number };

const BUFFER_MINUTES: Record<MeetingBuffer, number> = {
  none: 0,
  "15min": 15,
  "30min": 30,
  "45min": 45,
  "1hr": 60,
};

const MS_MIN = 60_000;
const SCAN_STEP_MIN = 30; // granularity when searching for free slots
const SCAN_DAYS = 5; // how far ahead to look
const MAX_SUGGESTIONS = 3;

/** Wall-clock hour+minute of an instant in a given IANA timezone. */
function localMinutes(iso: string, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return (h === 24 ? 0 : h) * 60 + m;
}

/** Short weekday (Mon, Tue…) of an instant in a timezone. */
function localWeekday(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(new Date(iso));
}

const hhmmToMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** True if [start,end] sits within the configured workday (Mon–Fri). */
function withinWorkHours(start: string, end: string, prefs: CalendarSettings): boolean {
  const tz = prefs.timezone || DEFAULT_TIMEZONE;
  const day = localWeekday(start, tz);
  if (day === "Sat" || day === "Sun") return false;

  const startMin = localMinutes(start, tz);
  const endMin = localMinutes(end, tz);
  const workStart = hhmmToMin(prefs.workdayStart);
  let workEnd = hhmmToMin(prefs.workdayEnd);
  if (workEnd <= workStart) workEnd = 24 * 60; // end past midnight → treat as EOD
  return startMin >= workStart && endMin > startMin && endMin <= workEnd;
}

function overlaps(candStart: number, candEnd: number, bufferMs: number, busy: Busy[]): boolean {
  const s = candStart - bufferMs;
  const e = candEnd + bufferMs;
  return busy.some((ev) => s < ev.end && e > ev.start);
}

/** Fetch non-all-day events from the start of `fromMs`'s day across the horizon. */
async function fetchBusy(userId: string, fromMs: number): Promise<Busy[]> {
  const windowStart = new Date(fromMs);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(fromMs + SCAN_DAYS * 24 * 60 * MS_MIN);
  const events = await listCalendarEvents(
    userId,
    windowStart.toISOString(),
    windowEnd.toISOString(),
  );
  return events
    .filter((e) => !e.allDay)
    .map((e) => ({
      title: e.title,
      start: new Date(e.start).getTime(),
      end: new Date(e.end).getTime(),
    }));
}

/** Scan forward in fixed steps for free, in-hours, buffer-respecting slots. */
function scanForward(
  busy: Busy[],
  fromMs: number,
  durationMs: number,
  prefs: CalendarSettings,
  count: number,
): Slot[] {
  const bufferMs = BUFFER_MINUTES[prefs.meetingBuffer] * MS_MIN;
  const scanEndMs = fromMs + SCAN_DAYS * 24 * 60 * MS_MIN;
  const slots: Slot[] = [];
  for (let c = fromMs; c < scanEndMs && slots.length < count; c += SCAN_STEP_MIN * MS_MIN) {
    const cStart = new Date(c).toISOString();
    const cEnd = new Date(c + durationMs).toISOString();
    if (!withinWorkHours(cStart, cEnd, prefs)) continue;
    if (overlaps(c, c + durationMs, bufferMs, busy)) continue;
    slots.push({ start: cStart, end: cEnd });
  }
  return slots;
}

/**
 * Deterministic availability check for a proposed meeting slot. Returns whether
 * it's free (no conflict, within work hours) and, if not, up to 3 alternative
 * slots — honoring work hours, weekends, and the meeting buffer.
 */
export async function checkAvailability(
  userId: string,
  prefs: CalendarSettings,
  proposed: Slot,
): Promise<AvailabilityResult> {
  const bufferMs = BUFFER_MINUTES[prefs.meetingBuffer] * MS_MIN;
  const startMs = new Date(proposed.start).getTime();
  const endMs = new Date(proposed.end).getTime();
  const durationMs = Math.max(endMs - startMs, 30 * MS_MIN);

  const busy = await fetchBusy(userId, startMs);
  const proposedClash = busy.filter(
    (ev) => startMs - bufferMs < ev.end && endMs + bufferMs > ev.start,
  );
  const isFree =
    proposedClash.length === 0 &&
    withinWorkHours(proposed.start, proposed.end, prefs);

  if (isFree) return { isFree: true, conflicts: [], suggestedSlots: [] };

  return {
    isFree: false,
    conflicts: proposedClash.map((c) => ({
      title: c.title,
      start: new Date(c.start).toISOString(),
      end: new Date(c.end).toISOString(),
    })),
    suggestedSlots: scanForward(
      busy,
      startMs + SCAN_STEP_MIN * MS_MIN,
      durationMs,
      prefs,
      MAX_SUGGESTIONS,
    ),
  };
}

/**
 * Find the next free slots from `fromIso` forward — used when a meeting is
 * requested without any specific time, to propose openings.
 */
export async function findFreeSlots(
  userId: string,
  prefs: CalendarSettings,
  fromIso: string,
  durationMins: number,
  count = MAX_SUGGESTIONS,
): Promise<Slot[]> {
  const fromMs = new Date(fromIso).getTime();
  const busy = await fetchBusy(userId, fromMs);
  return scanForward(busy, fromMs, durationMins * MS_MIN, prefs, count);
}
