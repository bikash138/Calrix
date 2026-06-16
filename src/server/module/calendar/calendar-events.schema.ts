import { z } from "zod";

//Input Schemas

export const listEventsInputSchema = z.object({
  timeMin: z.string().min(1, "timeMin is required"),
  timeMax: z.string().min(1, "timeMax is required"),
  calendarId: z.string().default("primary"),
});

export const getEventInputSchema = z.object({
  eventId: z
    .string()
    .min(1)
    .max(1024)
    .regex(/^[a-zA-Z0-9_\-]+$/, "Invalid event ID"),
});

const eventDateTimeSchema = z.object({
  dateTime: z.string().optional(), // ISO 8601 — non-all-day events
  date: z.string().optional(), // YYYY-MM-DD — all-day events
  timeZone: z.string().optional(),
});

const attendeeInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
});

export const createEventInputSchema = z.object({
  summary: z.string().min(1).max(1024),
  description: z.string().optional(),
  location: z.string().optional(),
  start: eventDateTimeSchema,
  end: eventDateTimeSchema,
  attendees: z.array(attendeeInputSchema).optional(),
  calendarId: z.string().default("primary"),
});

export const updateEventInputSchema = z.object({
  summary: z.string().min(1).max(1024).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  start: eventDateTimeSchema.optional(),
  end: eventDateTimeSchema.optional(),
  attendees: z.array(attendeeInputSchema).optional(),
  calendarId: z.string().default("primary"),
});

//Output Schemas

export const attendeeSchema = z.object({
  email: z.string(),
  name: z.string().nullable(),
  status: z.enum(["accepted", "declined", "tentative", "needsAction"]),
  self: z.boolean(),
});

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  start: z.string(), // ISO dateTime for timed events, YYYY-MM-DD for all-day
  end: z.string(),
  allDay: z.boolean(),
  status: z.enum(["confirmed", "tentative", "cancelled"]),
  htmlLink: z.string(),
  colorId: z.string().nullable(),
  attendees: z.array(attendeeSchema),
  organizer: z.object({
    email: z.string(),
    name: z.string().nullable(),
  }),
  isRecurring: z.boolean(),
});

export const calendarEventListSchema = z.object({
  events: z.array(calendarEventSchema),
  timeMin: z.string(),
  timeMax: z.string(),
});

//Inferred Types

export type ListEventsInput = z.infer<typeof listEventsInputSchema>;
export type GetEventInput = z.infer<typeof getEventInputSchema>;
export type CreateEventInput = z.infer<typeof createEventInputSchema>;
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;
export type Attendee = z.infer<typeof attendeeSchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CalendarEventList = z.infer<typeof calendarEventListSchema>;
