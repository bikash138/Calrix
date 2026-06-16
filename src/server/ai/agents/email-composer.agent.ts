import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getEmailComposerPrompt } from "../prompts/email-composer.prompt";

export function buildEmailComposerAgent(userName: string, signature?: string) {
  return tool({
    description: `Draft a polished, engaging email or reply. Call this whenever you need to compose email content — do NOT write raw email text yourself. 
      Pass the recipient name, the user's intent, and any relevant context (include the email thread so tone can be inferred). 
      Returns a ready-to-send subject and body.`,
    inputSchema: z.object({
      recipientName: z.string().describe("Full name of the recipient"),
      subject: z
        .string()
        .optional()
        .describe(
          "Subject line of the original email thread, if this is a reply. Helps infer the correct tone and urgency.",
        ),
      intent: z
        .string()
        .describe(
          "What the email should communicate, e.g. 'decline the meeting politely' or 'follow up on the invoice'",
        ),
      context: z
        .string()
        .optional()
        .describe(
          "The full email thread — include all messages, senders, and dates. The more thread content provided, the better the tone match.",
        ),
      isReply: z.boolean().optional().default(false),
    }),
    execute: async ({ recipientName, subject, intent, context, isReply }) => {
      const { text } = await generateText({
        model: openai("gpt-5.5"),
        system: getEmailComposerPrompt(userName, signature),
        prompt: `${isReply ? "Write a reply email" : "Write a new email"} to ${recipientName}.
                Intent: ${intent}${subject ? `\nOriginal subject: ${subject}` : ""}${context ? `\nThread:\n${context}` : ""}`,
      });

      try {
        const draft = JSON.parse(text) as { subject: string; body: string };
        return draft;
      } catch {
        return { subject: "", body: text };
      }
    },
  });
}
