import { z } from "zod";
import {
  UserRole,
  EmailVolume,
  UrgencySignal,
  SummaryStyle,
  FollowUpSensitivity,
} from "@/server/db/schema/settings";

const vals = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [T[keyof T], ...T[keyof T][]];

const vipEntry = z.union([
  z.email("Must be a valid email address"),
  z
    .string()
    .min(1, "Name cannot be empty")
    .max(60, "Name is too long")
    .regex(
      /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/,
      "Must be a valid name (letters and spaces only)",
    ),
]);

export const onboardingSchema = z
  .object({
    role: z.enum(vals(UserRole)),

    roleOther: z.string().max(50, "Max 50 characters").trim().default(""),

    volume: z.enum(vals(EmailVolume)),

    urgencySignals: z
      .array(z.enum(vals(UrgencySignal)))
      .min(1, "Select at least one urgency signal")
      .max(2, "Select at most two urgency signals")
      .refine(
        (arr) => new Set(arr).size === arr.length,
        "Duplicate urgency signals are not allowed",
      ),

    summaryStyle: z.enum(vals(SummaryStyle)),

    followUp: z.enum(vals(FollowUpSensitivity)),

    vipSenders: z
      .array(vipEntry)
      .max(5, "Max 5 VIP senders allowed")
      .refine(
        (arr) => new Set(arr).size === arr.length,
        "Duplicate VIP senders are not allowed",
      )
      .default([]),

    trainingOptOut: z.boolean({
      error: "Privacy preference must be true or false",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.role === UserRole.OTHER && data.roleOther.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["roleOther"],
        message: "Please describe your role",
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
