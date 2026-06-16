import { z } from "zod";

// ── Input Schemas ──────────────────────────────────────────────────────────────

export const inboxFilterSchema = z.enum([
  "all",
  "unread",
  "starred",
  "sent",
  "trash",
]);

export const listThreadsInputSchema = z.object({
  filter: inboxFilterSchema.catch("all"),
  pageToken: z.string().optional(),
});

export const getThreadInputSchema = z.object({
  threadId: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[^\\/]+$/, "Invalid thread ID"),
});

// ── Output Schemas ─────────────────────────────────────────────────────────────

export const attachmentSchema = z.object({
  attachmentId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const threadRowSchema = z.object({
  id: z.string(),
  subject: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),
  date: z.string().nullable(),
  snippet: z.string(),
  unread: z.boolean(),
  starred: z.boolean(),
  messageCount: z.number(),
});

export const threadMessageSchema = z.object({
  id: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string().nullable(),
  textBody: z.string(),
  htmlBody: z.string(),
  attachments: z.array(attachmentSchema),
  unread: z.boolean(),
  starred: z.boolean(),
});

export const threadDetailSchema = z.object({
  id: z.string(),
  messages: z.array(threadMessageSchema),
});

export const inboxListPageSchema = z.object({
  threads: z.array(threadRowSchema),
  nextPageToken: z.string().nullable(),
});

// ── Inferred Types ─────────────────────────────────────────────────────────────

export type InboxFilter = z.infer<typeof inboxFilterSchema>;
export type ListThreadsInput = z.infer<typeof listThreadsInputSchema>;
export type GetThreadInput = z.infer<typeof getThreadInputSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type ThreadRow = z.infer<typeof threadRowSchema>;
export type ThreadMessage = z.infer<typeof threadMessageSchema>;
export type ThreadDetail = z.infer<typeof threadDetailSchema>;
export type InboxListPage = z.infer<typeof inboxListPageSchema>;
