import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { ApiError } from "@/server/errors/api.error";
import { userFactsRepo } from "@/server/module/user-facts/user-facts.repo";
import { cacheRemoveFact } from "@/server/module/user-facts/facts-cache";

export const GET = createHandler({
  auth: true,
  rateLimit: "default",
  handler: async ({ user }) => {
    const facts = await userFactsRepo.listForUser(user.id);
    return ok(facts);
  },
});

export const DELETE = createHandler({
  auth: true,
  rateLimit: "default",
  handler: async ({ req, user }) => {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw ApiError.badRequest("Missing fact id");

    const removed = await userFactsRepo.remove(user.id, id);
    if (removed) await cacheRemoveFact(user.id, id);
    return ok({ removed });
  },
});
