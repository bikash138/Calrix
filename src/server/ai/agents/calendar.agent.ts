import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  CalendarAgentPrefs,
  getCalendarAgentPrompt,
} from "../prompts/calendar-agent.prompt";

export function buildCalendarAgent(
  currentDate: string,
  timezone: string,
  mcpTools: ToolSet,
  calendarPrefs: CalendarAgentPrefs,
) {
  return tool({
    description: `Google Calendar agent. Handles ALL calendar write operations: check_availability (find free slots), create_event, update_event, delete_event. 
      Never call run_script directly for calendar writes — always delegate here.`,
    inputSchema: z.object({
      task: z
        .enum([
          "check_availability",
          "create_event",
          "update_event",
          "delete_event",
        ])
        .describe("Which operation to perform"),
      intent: z
        .string()
        .describe(
          "Natural language description, e.g. '1hr meeting with Ram tomorrow at 9pm'",
        ),
      proposedStart: z
        .string()
        .optional()
        .describe(
          "Proposed or confirmed start time as ISO 8601 string — required for check/create",
        ),
      proposedEnd: z
        .string()
        .optional()
        .describe(
          "Proposed or confirmed end time as ISO 8601 string — required for check/create",
        ),
      eventId: z
        .string()
        .optional()
        .describe("Google Calendar event ID — required for update/delete"),
      summary: z
        .string()
        .optional()
        .describe("Event title — for create/update"),
      description: z
        .string()
        .optional()
        .describe("Event body/description — for create/update"),
      attendeeEmails: z
        .array(z.string())
        .optional()
        .describe("Attendee email addresses"),
    }),
    execute: async ({
      task,
      intent,
      proposedStart,
      proposedEnd,
      eventId,
      summary,
      description,
      attendeeEmails,
    }) => {
      const { text } = await generateText({
        model: openai("gpt-5.5"),
        system: getCalendarAgentPrompt(currentDate, timezone, calendarPrefs),
        prompt: `Task: ${task}
                Intent: ${intent}
                ${proposedStart ? `Proposed start: ${proposedStart}` : ""}
                ${proposedEnd ? `Proposed end: ${proposedEnd}` : ""}
                ${eventId ? `Event ID: ${eventId}` : ""}
                ${summary ? `Title: ${summary}` : ""}
                ${description ? `Description: ${description}` : ""}
                ${attendeeEmails?.length ? `Attendees: ${attendeeEmails.join(", ")}` : ""}

                Execute the task and return the JSON result.`,
        tools: mcpTools,
        stopWhen: stepCountIs(5),
      });

      try {
        return JSON.parse(text);
      } catch {
        return { task, error: text };
      }
    },
  });
}
