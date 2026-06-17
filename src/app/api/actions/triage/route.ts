import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { inngest } from "@/server/inngest/client";
import { TriageRunTrigger } from "@/server/db/schema/triage";
import { rateLimiters } from "@/server/lib/rate-limit";

const TRIAGE_LIMIT = 3;

export const GET = createHandler({
  auth: true,
  handler: async ({ user }) => {
    const res = await rateLimiters.triage.get(user.id);
    const remaining = res ? res.remainingPoints : TRIAGE_LIMIT;
    const resetInMs = res ? res.msBeforeNext : 0;
    return ok({ remaining, resetInMs });
  },
});

export const POST = createHandler({
  auth: true,
  rateLimit: "triage",
  handler: async ({ user }) => {
    const { ids } = await inngest.send({
      name: "triage/user.requested" as const,
      data: {
        userId: user.id,
        trigger: TriageRunTrigger.MANUAL,
      },
    });

    return ok({ eventId: ids[0] });
  },
});
