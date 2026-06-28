import { z } from "zod";

/**
 * `useChat` posts UIMessages (role + typed `parts`, including tool-call/result
 * parts), not flat {role, content} pairs. We validate the envelope structurally
 * and let `convertToModelMessages` handle the parts — the previous
 * alternating-roles / last-must-be-user refinements no longer hold once
 * assistant tool-call turns are interleaved.
 */
const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(z.any()),
  metadata: z.any().optional(),
});

export const chatRequestSchema = z.object({
  // useChat transport extras (ignored server-side but allowed through validation)
  id: z.string().optional(),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
  messages: z.array(uiMessageSchema).min(1).max(100),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
