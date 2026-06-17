import { type NextRequest } from "next/server";
import { z } from "zod";

import { createHandler } from "@/server/api/request-pipeline";
import { noContent } from "@/server/api/response";
import { sendReply } from "@/server/module/actions/reply.service";

const sendSchema = z.object({
  draft: z.string().min(1).max(20000),
});

export function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return createHandler({
    auth: true,
    rateLimit: "strict",
    schema: sendSchema,
    handler: async ({ user, body }) => {
      const { id } = await params;
      await sendReply(user.id, id, body.draft);
      return noContent();
    },
  })(req);
}
