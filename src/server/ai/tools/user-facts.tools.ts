import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { FactCategory } from "@/server/db/schema/user-facts";
import { userFactsRepo } from "@/server/module/user-facts/user-facts.repo";
import {
  cacheAddFact,
  cacheRemoveFact,
} from "@/server/module/user-facts/facts-cache";

/**
 * Durable-memory tools for the chat agent. 
 * `remember_fact` saves a lasting fact or preference the user states; 
 * `forget_fact` removes one they correct or retract. 
 * Both write to Postgres (durable) and the Redis hot cache (write-through).
 */
export function createUserFactsTools(userId: string): ToolSet {
  return {
    remember_fact: tool({
      description: `Save a DURABLE fact or preference about the user so it persists across future conversations.
                    Use ONLY for lasting things the user states about themselves or how they like things done —
                    e.g. 'keep my replies short', 'Ram is my co-founder', 'always CC my assistant', "we're a B2B fintech".
                    Do NOT save one-off task details ('book it at 3pm today', 'send this to Ram').
                    Do NOT save anything already in the user's settings (role, summary style, VIP senders, workday hours,
                    timezone) — only the nuance settings can't capture. Timezone in particular is strict and panel-only:
                    never save it as a fact.`,
      inputSchema: z.object({
        category: z.enum([
          FactCategory.IDENTITY,
          FactCategory.PREFERENCE,
          FactCategory.RELATIONSHIP,
          FactCategory.WORK,
          FactCategory.OTHER,
        ]),
        content: z
          .string()
          .min(3)
          .max(200)
          .describe(
            "Concise third-person fact, e.g. 'Prefers replies under 3 sentences'",
          ),
      }),
      execute: async ({ category, content }) => {
        const res = await userFactsRepo.add(userId, { category, content });
        if (!res.ok) return { saved: false, reason: res.reason };
        if (!res.deduped)
          await cacheAddFact(userId, {
            id: res.id,
            category,
            content,
            createdAt: res.createdAt,
          });
        return { saved: true, deduped: res.deduped };
      },
    }),

    forget_fact: tool({
      description: `Remove a previously saved fact when the user corrects or retracts it (e.g. 'actually Priya is my EA now').
                    Pass the [id] shown next to the fact in the saved-facts list. For a correction, call forget_fact on the
                    old fact, then remember_fact with the new value.`,
      inputSchema: z.object({
        factId: z
          .string()
          .describe("The [id] shown next to the fact, e.g. 'a1b2c3d4'"),
      }),
      execute: async ({ factId }) => {
        const removed = await userFactsRepo.remove(userId, factId);
        if (removed) await cacheRemoveFact(userId, factId);
        return { removed };
      },
    }),
  };
}
