import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { ContactSource } from "@/server/db/schema/contacts";
import { contactsRepo } from "@/server/module/contacts/contacts.repo";

/**
 * Contact-memory tools for the chat agent. `lookup_contact` resolves a name to
 * an email so the agent never has to ask; `remember_contact` saves a new one
 * the user provides.
 */
export function createContactTools(userId: string): ToolSet {
  return {
    lookup_contact: tool({
      description: `Resolve a person's email address by name. Call this BEFORE composing or sending an email whenever the user refers to someone by name.
                    Returns ranked candidate contacts. Then:
                    - exactly 1 match → use that email.
                    - 2+ matches → ask the user to pick with request_user_input(kind: "radio").
                    - 0 matches → ask the user for the email, then call remember_contact to save it.`,
      inputSchema: z.object({
        name: z
          .string()
          .describe("The person's name or partial name, e.g. 'Bikash'"),
      }),
      execute: async ({ name }) => {
        const matches = await contactsRepo.search(userId, name, 5);
        return { matches };
      },
    }),

    remember_contact: tool({
      description:
        "Save a person's email address so it can be recalled later. Call this right after the user gives you an email for someone you couldn't find with lookup_contact.",
      inputSchema: z.object({
        name: z.string(),
        email: z.email(),
      }),
      execute: async ({ name, email }) => {
        await contactsRepo.upsertMany(
          userId,
          [{ name, email }],
          ContactSource.MANUAL,
        );
        return { saved: true };
      },
    }),
  };
}
