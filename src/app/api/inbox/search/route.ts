import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { searchInbox } from "@/server/module/inbox/search-inbox.service";

export const GET = createHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    if (!q.trim()) return ok({ threads: [] });

    const threads = await searchInbox(user.id, q);
    return ok({ threads });
  },
});
