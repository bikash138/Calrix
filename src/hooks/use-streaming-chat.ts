"use client";

import { useChat, Chat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { REQUEST_USER_INPUT_TOOL } from "@/lib/request-input.schema";

/**
 * Single shared chat session so the dedicated chat page and the ⌘K command
 * palette operate on the *same* conversation. `sendAutomaticallyWhen` makes the
 * run resume the moment a client-side tool (our `request_user_input` widget)
 * gets its result via `addToolResult` — no full re-call.
 */
export const chatSession = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest({ messages, id, trigger, messageId }) {
      return {
        body: {
          id,
          trigger,
          messageId,
          messages,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };
    },
  }),
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
});

export function useStreamingChat() {
  return useChat({ chat: chatSession });
}

// ---------------------------------------------------------------------------
// Helpers for the parts-based UIMessage shape
// ---------------------------------------------------------------------------

/** Concatenate all text parts of a message (for markdown rendering). */
export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export const REQUEST_INPUT_PART_TYPE =
  `tool-${REQUEST_USER_INPUT_TOOL}` as const;

export type PendingUserInput = {
  toolCallId: string;
  /** The validated tool input describing which widget to render. */
  input: unknown;
};

/**
 * Returns the first unresolved `request_user_input` tool call across all
 * messages (state "input-available" = awaiting the user). `undefined` when the
 * input bar should show the normal textarea.
 */
export function getPendingUserInput(
  messages: UIMessage[],
): PendingUserInput | undefined {
  for (const message of messages) {
    for (const part of message.parts) {
      if (
        part.type === REQUEST_INPUT_PART_TYPE &&
        "state" in part &&
        part.state === "input-available"
      ) {
        return {
          toolCallId: (part as { toolCallId: string }).toolCallId,
          input: (part as { input: unknown }).input,
        };
      }
    }
  }
  return undefined;
}
