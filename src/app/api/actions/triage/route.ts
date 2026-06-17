import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { inngest } from "@/server/inngest/client";
import { TriageRunTrigger } from "@/server/db/schema/triage";

export const POST = createHandler({
  auth: true,
  handler: async ({ user }) => {
    const { ids } = await inngest.send({
      name: "triage/user.requested" as const,
      data: {
        userId:  user.id,
        trigger: TriageRunTrigger.MANUAL,
      },
    });

    return ok({ eventId: ids[0] });
  },
});
