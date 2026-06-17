import { type NextRequest } from "next/server";
import { z } from "zod";

import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { composeReply } from "@/server/module/actions/reply.service";

const composeSchema = z.object({
  instruction: z.string().max(2000).optional(),
  draft: z.string().max(20000).optional(),
});

export function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return createHandler({
    auth: true,
    rateLimit: "chat",
    schema: composeSchema,
    handler: async ({ user, body }) => {
      const { id } = await params;
      const result = await composeReply(user.id, id, {
        instruction: body.instruction,
        currentDraft: body.draft,
      });
      return ok(result);
    },
  })(req);
}
