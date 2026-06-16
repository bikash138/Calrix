import { corsair } from "@/server/corsair";
import type {
  CreateEventInput,
  UpdateEventInput,
  CalendarEvent,
} from "./calendar-events.schema";
import { normalizeEvent } from "@/server/lib/utils/normalize-event";

export async function createCalendarEvent(
  userId: string,
  input: CreateEventInput,
): Promise<CalendarEvent> {
  const { calendarId = "primary", ...eventFields } = input;
  const tenant = corsair.withTenant(userId);

  const raw = await tenant.googlecalendar.api.events.create({
    calendarId,
    event: {
      summary: eventFields.summary,
      ...(eventFields.description && { description: eventFields.description }),
      ...(eventFields.location && { location: eventFields.location }),
      start: eventFields.start,
      end: eventFields.end,
      ...(eventFields.attendees && { attendees: eventFields.attendees }),
    },
  });

  return normalizeEvent(raw);
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  input: UpdateEventInput,
): Promise<CalendarEvent> {
  const { calendarId = "primary", ...patch } = input;
  const tenant = corsair.withTenant(userId);

  const existing = await tenant.googlecalendar.api.events.get({
    id: eventId,
    calendarId,
  });

  const raw = await tenant.googlecalendar.api.events.update({
    id: eventId,
    calendarId,
    event: {
      ...existing,
      ...(patch.summary !== undefined && { summary: patch.summary }),
      ...(patch.description !== undefined && {
        description: patch.description,
      }),
      ...(patch.location !== undefined && { location: patch.location }),
      ...(patch.start !== undefined && { start: patch.start }),
      ...(patch.end !== undefined && { end: patch.end }),
      ...(patch.attendees !== undefined && { attendees: patch.attendees }),
    },
  });

  return normalizeEvent(raw);
}

export async function deleteCalendarEvent(
  userId: string,
  eventId: string,
  calendarId = "primary",
): Promise<void> {
  const tenant = corsair.withTenant(userId);
  await tenant.googlecalendar.api.events.delete({ id: eventId, calendarId });
}
