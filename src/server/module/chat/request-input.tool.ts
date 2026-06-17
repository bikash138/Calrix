import { tool } from "ai";
import { requestUserInputSchema } from "@/lib/request-input.schema";

/**
 * Human-in-the-loop tool. It deliberately has NO `execute` function — the AI SDK
 * therefore streams the tool call to the client and pauses the run. The chat UI
 * renders the matching widget in the input bar, the user submits, and the result
 * is fed back via `addToolResult`, which resumes the same run (no full re-call).
 */
export const requestUserInputTool = tool({
  description: `Ask the user for structured input by transforming the chat input bar into an interactive widget.
Call this the MOMENT you need a choice or details from the user that are better captured with controls than free text:
- "radio": pick exactly one of a few options (e.g. which time slot, which calendar).
- "multiselect": pick several (e.g. which attendees, which labels).
- "form": collect a few free-text fields.
- "event_form": confirm/collect calendar event details — pass everything you already inferred in "prefilled".

Rules:
- Emit NO accompanying text when you call this; the "label" field is the question the user sees. The chat area stays clean.
- Every radio/multiselect automatically gets an "Other" escape hatch in the UI — do NOT add your own "Other"/"Something else" option.
- After the user responds you will receive the result and should continue the task. If their custom answer is too vague, call this tool again with a fresh set rather than guessing.`,
  inputSchema: requestUserInputSchema,
  // no execute → client resolves it
});
