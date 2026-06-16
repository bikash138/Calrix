import { type NextRequest } from "next/server";
import { createHandler } from "@/server/api/request-pipeline";
import { ok, noContent } from "@/server/api/response";
import { ApiError } from "@/server/errors/api.error";
import { getEventInputSchema, updateEventInputSchema } from "@/server/module/calendar/calendar-events.schema";
import { getCalendarEvent } from "@/server/module/calendar/get-calendar-event.service";
import { updateCalendarEvent, deleteCalendarEvent } from "@/server/module/calendar/mutate-calendar-event.service";

function parseEventId(raw: string): string {
  const result = getEventInputSchema.shape.eventId.safeParse(raw);
  if (!result.success) throw ApiError.badRequest("Invalid event ID");
  return result.data;
}

export function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  return createHandler({
    auth: true,
    handler: async ({ user }) => {
      const { eventId } = await params;
      const event = await getCalendarEvent(user.id, parseEventId(eventId));
      return ok({ event });
    },
  })(req);
}

export function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  return createHandler({
    auth: true,
    schema: updateEventInputSchema,
    handler: async ({ user, body }) => {
      const { eventId } = await params;
      const event = await updateCalendarEvent(user.id, parseEventId(eventId), body);
      return ok({ event });
    },
  })(req);
}

export function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  return createHandler({
    auth: true,
    handler: async ({ user }) => {
      const { eventId } = await params;
      await deleteCalendarEvent(user.id, parseEventId(eventId));
      return noContent();
    },
  })(req);
}
