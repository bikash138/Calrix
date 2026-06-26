import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { warmFactsCache } from "@/server/module/user-facts/facts-cache";

export const POST = createHandler({
  auth: true,
  rateLimit: "default",
  handler: async ({ user }) => {
    await warmFactsCache(user.id);
    return ok({ warmed: true });
  },
});
