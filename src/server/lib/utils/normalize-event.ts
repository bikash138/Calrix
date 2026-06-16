import type { Event as GCalEvent } from "@corsair-dev/googlecalendar";
import type { CalendarEvent } from "@/server/module/calendar/calendar-events.schema";

export function normalizeEvent(raw: GCalEvent): CalendarEvent {
  const allDay = !raw.start?.dateTime;

  return {
    id: raw.id ?? "",
    title: raw.summary ?? "(no title)",
    description: raw.description ?? null,
    location: raw.location ?? null,
    start: raw.start?.dateTime ?? raw.start?.date ?? "",
    end: raw.end?.dateTime ?? raw.end?.date ?? "",
    allDay,
    status: raw.status ?? "confirmed",
    htmlLink: raw.htmlLink ?? "",
    colorId: raw.colorId ?? null,
    attendees: (raw.attendees ?? []).map((a) => ({
      email: a.email ?? "",
      name: a.displayName ?? null,
      status: a.responseStatus ?? "needsAction",
      self: a.self ?? false,
    })),
    organizer: {
      email: raw.organizer?.email ?? "",
      name: raw.organizer?.displayName ?? null,
    },
    isRecurring: !!(raw.recurringEventId ?? raw.recurrence?.length),
  };
}
