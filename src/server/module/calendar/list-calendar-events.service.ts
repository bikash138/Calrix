import { corsair } from "@/server/corsair";
import type { CalendarEvent } from "./calendar-events.schema";
import { normalizeEvent } from "../../lib/utils/normalize-event";

export async function listCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string,
  calendarId = "primary",
): Promise<CalendarEvent[]> {
  const tenant = corsair.withTenant(userId);

  const result = await tenant.googlecalendar.api.events.getMany({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return (result.items ?? []).map(normalizeEvent);
}
