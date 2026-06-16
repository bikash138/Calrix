import { z } from "zod";

//Input Schema

export const inboxActionSchema = z.enum([
  "markRead",
  "markUnread",
  "star",
  "unstar",
  "archive",
  "trash",
]);

export const patchThreadInputSchema = z.object({
  action: inboxActionSchema,
});

//Inferred Types

export type InboxAction = z.infer<typeof inboxActionSchema>;
export type PatchThreadInput = z.infer<typeof patchThreadInputSchema>;
