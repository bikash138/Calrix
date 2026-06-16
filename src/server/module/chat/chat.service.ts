import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { createEmailsTools } from "@/server/module/emails/emails.tools";
import { getChatSystemPrompt } from "@/server/data/prompt/chat.prompt";
import { settingsRepo } from "@/server/module/settings/settings.repo";
import { DEFAULT_AI, DEFAULT_CALENDAR, DEFAULT_INBOX } from "@/server/db/schema/settings";
import type { ChatRequest } from "./chat.schema";

export const chatService = {
  stream: async (
    userId: string,
    userName: string,
    body: ChatRequest,
  ): Promise<Response> => {
    const timezone = body.timezone ?? "UTC";
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: timezone,
    });

    const userPrefs = await settingsRepo.findByUserId(userId);

    const ai = userPrefs?.ai ?? DEFAULT_AI;
    const calendar = userPrefs?.calendar ?? DEFAULT_CALENDAR;
    const inbox = userPrefs?.inbox ?? DEFAULT_INBOX;

    const tools = await createEmailsTools(userId, userName, timezone, currentDate, inbox.signature, calendar);

    const result = streamText({
      model: openai("gpt-5-mini"),
      system: getChatSystemPrompt(currentDate, timezone, {
        role: ai.role,
        roleOther: ai.roleOther,
        summaryStyle: ai.summaryStyle,
        vipSenders: inbox.vipSenders,
      }),
      messages: body.messages,
      tools,
      stopWhen: stepCountIs(15),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const textPart of result.textStream) {
          controller.enqueue(encoder.encode(textPart));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
