import { z } from "zod";

/**
 * Shared contract for the `request_user_input` human-in-the-loop tool.
 *
 * - The *input* schema (what the AI fills) describes which widget the input bar
 *   should render. It is used as the tool's `inputSchema` on the server.
 * - The *result* schema (what the user submits) is validated client-side before
 *   it is handed back to the AI via `addToolResult`, so the model never resumes
 *   with malformed data.
 *
 * Keep this file free of server-only imports — it is consumed by client widgets.
 */

// ---------------------------------------------------------------------------
// Event draft (used by the `event_form` widget)
// ---------------------------------------------------------------------------

export const eventDraftSchema = z.object({
  summary: z.string(),
  /** ISO 8601 start, e.g. "2026-06-18T13:00:00" */
  start: z.string(),
  /** ISO 8601 end */
  end: z.string(),
  location: z.string(),
  description: z.string(),
  attendeeEmails: z.array(z.email()),
});
export type EventDraft = z.infer<typeof eventDraftSchema>;

/** Partial draft the AI may pre-fill — every field optional so it can fill only what it knows. */
export const eventDraftPartialSchema = eventDraftSchema.partial();
export type EventDraftPartial = z.infer<typeof eventDraftPartialSchema>;

// ---------------------------------------------------------------------------
// Email draft (used by the `email_draft` widget)
// ---------------------------------------------------------------------------

export const emailDraftSchema = z.object({
  /** Recipient email address (or name if the address is unknown). */
  to: z.string(),
  subject: z.string(),
  body: z.string(),
});
export type EmailDraft = z.infer<typeof emailDraftSchema>;

// ---------------------------------------------------------------------------
// Generic form field (used by the `form` widget)
// ---------------------------------------------------------------------------

export const formFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "textarea", "email", "date", "datetime"]),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});
export type FormField = z.infer<typeof formFieldSchema>;

// ---------------------------------------------------------------------------
// TOOL INPUT — what the AI provides to render the input-bar widget
// ---------------------------------------------------------------------------

/** The widget payload the AI describes. */
export const userInputRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("radio"),
    label: z.string().describe("The question shown above the radio options"),
    options: z.array(z.string()).min(1).max(8),
  }),
  z.object({
    kind: z.literal("multiselect"),
    label: z.string().describe("The question shown above the checkboxes"),
    options: z.array(z.string()).min(1).max(12),
  }),
  z.object({
    kind: z.literal("form"),
    label: z.string(),
    fields: z.array(formFieldSchema).min(1).max(10),
  }),
  z.object({
    kind: z.literal("event_form"),
    label: z.string().describe("Short prompt, e.g. 'Confirm the event details'"),
    prefilled: eventDraftPartialSchema.optional(),
  }),
  z.object({
    kind: z.literal("email_draft"),
    label: z.string().describe("Short prompt, e.g. 'Review and send this email'"),
    to: z.string().describe("Recipient email address"),
    subject: z.string(),
    body: z.string().describe("The full composed email body from compose_email"),
  }),
]);
export type UserInputRequest = z.infer<typeof userInputRequestSchema>;

/**
 * The tool's actual input schema. OpenAI requires a function's top-level
 * parameters to be a JSON Schema `type: "object"`, so the discriminated union
 * (which compiles to a top-level `anyOf`) is wrapped under `request`.
 */
export const requestUserInputSchema = z.object({
  request: userInputRequestSchema,
});
export type RequestUserInput = z.infer<typeof requestUserInputSchema>;

// ---------------------------------------------------------------------------
// TOOL RESULT — what the user submits (validated before addToolResult)
// ---------------------------------------------------------------------------

export const userInputResultSchema = z.discriminatedUnion("status", [
  /** A single listed option was picked. */
  z.object({ status: z.literal("selected"), value: z.string() }),
  /** Multiple listed options were picked. */
  z.object({ status: z.literal("multiselected"), values: z.array(z.string()).min(1) }),
  /** "Other" was chosen — free text the user typed. */
  z.object({ status: z.literal("custom"), value: z.string().min(1) }),
  /** Generic form submitted. */
  z.object({ status: z.literal("form"), data: z.record(z.string(), z.string()) }),
  /** Event form submitted — fully validated, ready to create. */
  z.object({ status: z.literal("event"), event: eventDraftSchema }),
  /** Email draft approved (possibly edited) — ready to send. */
  z.object({ status: z.literal("email"), email: emailDraftSchema }),
  /** User wants the AI to polish the draft further before sending. */
  z.object({
    status: z.literal("revise"),
    instruction: z.string().min(1),
    email: emailDraftSchema,
  }),
  /** User explicitly declined a confirmation (e.g. "Don't send"). */
  z.object({ status: z.literal("declined"), reason: z.string().optional() }),
]);
export type UserInputResult = z.infer<typeof userInputResultSchema>;

export const REQUEST_USER_INPUT_TOOL = "request_user_input" as const;
