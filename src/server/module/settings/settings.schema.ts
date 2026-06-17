import { z } from "zod";
import {
  InboxView,
  SummaryStyle,
  FollowUpSensitivity,
  CalendarView,
  WeekStart,
  WorkdayStart,
  WorkdayEnd,
  MeetingBuffer,
  UserRole,
  EmailVolume,
  UrgencySignal,
  DEFAULT_TIMEZONE,
} from "@/server/db/schema/settings";

const vals = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [T[keyof T], ...T[keyof T][]];

export const inboxSchema = z.object({
  defaultView: z.enum(vals(InboxView)),
  signature: z.string().max(1000),
  urgencySignals: z
    .array(z.enum(vals(UrgencySignal)))
    .max(2)
    .default([]),
  vipSenders: z.array(z.string()).max(5).default([]),
});

const isValidTimezone = (tz: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const calendarSchema = z.object({
  defaultView: z.enum(vals(CalendarView)),
  weekStartsOn: z.enum(vals(WeekStart)),
  workdayStart: z.enum(vals(WorkdayStart)),
  workdayEnd: z.enum(vals(WorkdayEnd)),
  meetingBuffer: z.enum(vals(MeetingBuffer)),
  timezone: z
    .string()
    .refine(isValidTimezone, "Invalid timezone")
    .default(DEFAULT_TIMEZONE),
});

export const aiSchema = z.object({
  summaryStyle: z.enum(vals(SummaryStyle)),
  followUpSensitivity: z.enum(vals(FollowUpSensitivity)),
  trainingOptOut: z.boolean(),
  role: z.enum(vals(UserRole)).nullable().default(null),
  roleOther: z.string().max(100).default(""),
  volume: z.enum(vals(EmailVolume)).nullable().default(null),
});

export const preferencesSchema = z.object({
  inbox: inboxSchema,
  calendar: calendarSchema,
  ai: aiSchema,
});
