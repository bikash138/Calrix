import { z } from "zod";
import { createHandler } from "@/server/api/request-pipeline";
import { ok, noContent } from "@/server/api/response";
import { actionsRepo } from "@/server/module/actions/actions.repo";
import { ActionStatus } from "@/server/db/schema/triage";

const statusValues = [
  ActionStatus.PENDING,
  ActionStatus.ACTIONED,
  ActionStatus.DISMISSED,
] as const;

export const GET = createHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const status =
      req.nextUrl.searchParams.get("status") ?? ActionStatus.PENDING;
    const parsed = z.enum(statusValues).safeParse(status);
    const resolvedStatus = parsed.success ? parsed.data : ActionStatus.PENDING;

    const items = await actionsRepo.findByUserId(user.id, resolvedStatus);
    return ok(items);
  },
});

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(statusValues),
});

export const PATCH = createHandler({
  auth: true,
  schema: patchSchema,
  handler: async ({ user, body }) => {
    await actionsRepo.updateStatus(body.id, user.id, body.status);
    return noContent();
  },
});
