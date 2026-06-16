import { corsair } from "@/server/corsair";
import { ApiError } from "@/server/errors/api.error";
import type { CalendarEvent } from "./calendar-events.schema";
import { normalizeEvent } from "../../lib/utils/normalize-event";

export async function getCalendarEvent(
  userId: string,
  eventId: string,
  calendarId = "primary",
): Promise<CalendarEvent> {
  const tenant = corsair.withTenant(userId);

  const raw = await tenant.googlecalendar.api.events.get({
    id: eventId,
    calendarId,
  });

  if (!raw?.id) throw ApiError.notFound("Event not found");

  return normalizeEvent(raw);
}
