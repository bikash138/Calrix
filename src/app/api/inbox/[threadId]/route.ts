import { type NextRequest } from "next/server";
import { createHandler } from "@/server/api/request-pipeline";
import { ok, noContent } from "@/server/api/response";
import { ApiError } from "@/server/errors/api.error";
import { getInboxEmail } from "@/server/module/inbox/get-inbox-email.service";
import { patchInboxEmail } from "@/server/module/inbox/patch-inbox-email.service";
import { getThreadInputSchema } from "@/server/module/inbox/get-inbox-email.schema";
import {
  patchThreadInputSchema,
  type InboxAction,
} from "@/server/module/inbox/patch-inbox-email.schema";

function parseThreadId(raw: string): string {
  const result = getThreadInputSchema.shape.threadId.safeParse(raw);
  if (!result.success) throw ApiError.badRequest("Invalid thread ID");
  return result.data;
}

export function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  return createHandler({
    auth: true,
    handler: async ({ user }) => {
      const { threadId } = await params;
      const data = await getInboxEmail(user.id, parseThreadId(threadId));
      return ok(data);
    },
  })(req);
}

export function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  return createHandler({
    auth: true,
    handler: async ({ user }) => {
      const { threadId } = await params;
      await patchInboxEmail(user.id, parseThreadId(threadId), "trash");
      return noContent();
    },
  })(req);
}

export function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  return createHandler({
    auth: true,
    schema: patchThreadInputSchema,
    handler: async ({ user, body }) => {
      const { threadId } = await params;
      await patchInboxEmail(
        user.id,
        parseThreadId(threadId),
        body.action as InboxAction,
      );
      return noContent();
    },
  })(req);
}
