import { openai } from "@ai-sdk/openai";
import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { requestUserInputTool } from "./request-input.tool";
import { settingsRepo } from "@/server/module/settings/settings.repo";
import { getChatSystemPrompt } from "@/server/ai/prompts/chat.prompt";
import { createContactTools } from "@/server/ai/tools/contacts.tools";
import { createUserFactsTools } from "@/server/ai/tools/user-facts.tools";
import { createEmailsTools } from "@/server/ai/tools/tool";
import { getProfileBlock } from "@/server/module/user-facts/facts-cache";
import type { ChatRequest } from "./chat.schema";

export const chatService = {
  stream: async (
    userId: string,
    userName: string,
    body: ChatRequest,
  ): Promise<Response> => {
    const { ai, calendar, inbox } = (await settingsRepo.findByUserId(userId))!;

    const timezone = calendar.timezone ?? "UTC";
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: timezone,
    });
    const [emailTools, userFactsBlock] = await Promise.all([
      createEmailsTools(
        userId,
        userName,
        timezone,
        currentDate,
        inbox.signature,
        calendar,
      ),
      getProfileBlock(userId),
    ]);

    const tools = {
      ...emailTools,
      ...createContactTools(userId),
      ...createUserFactsTools(userId),
      request_user_input: requestUserInputTool,
    };

    const result = streamText({
      model: openai("gpt-5.1"),
      system: getChatSystemPrompt(
        currentDate,
        timezone,
        {
          role: ai.role,
          roleOther: ai.roleOther,
          vipSenders: inbox.vipSenders,
        },
        userFactsBlock,
      ),
      messages: await convertToModelMessages(body.messages),
      tools,
      stopWhen: stepCountIs(15),
    });

    return result.toUIMessageStreamResponse();
  },
};
