import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { inngest } from "@/server/inngest/client";
import { rateLimiters } from "@/server/lib/rate-limit";

const SYNC_LIMIT = 3;

export const GET = createHandler({
  auth: true,
  handler: async ({ user }) => {
    const res = await rateLimiters.contactsSync.get(user.id);
    const remaining = res ? res.remainingPoints : SYNC_LIMIT;
    const resetInMs = res ? res.msBeforeNext : 0;
    return ok({ remaining, resetInMs });
  },
});

export const POST = createHandler({
  auth: true,
  rateLimit: "contactsSync",
  handler: async ({ user }) => {
    const { ids } = await inngest.send({
      name: "contacts/sync" as const,
      data: { userId: user.id },
    });
    return ok({ eventId: ids[0] });
  },
});
