import { createHandler } from "@/server/api/request-pipeline";
import { ok, created } from "@/server/api/response";
import { ApiError } from "@/server/errors/api.error";
import { createEventInputSchema } from "@/server/module/calendar/calendar-events.schema";
import { listCalendarEvents } from "@/server/module/calendar/list-calendar-events.service";
import { createCalendarEvent } from "@/server/module/calendar/mutate-calendar-event.service";

export const GET = createHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const sp = req.nextUrl.searchParams;
    const timeMin = sp.get("timeMin");
    const timeMax = sp.get("timeMax");
    const calendarId = sp.get("calendarId") ?? "primary";

    if (!timeMin || !timeMax) throw ApiError.badRequest("timeMin and timeMax are required");

    const events = await listCalendarEvents(user.id, timeMin, timeMax, calendarId);
    return ok({ events, timeMin, timeMax });
  },
});

export const POST = createHandler({
  auth: true,
  schema: createEventInputSchema,
  handler: async ({ user, body }) => {
    const event = await createCalendarEvent(user.id, body);
    return created({ event });
  },
});
