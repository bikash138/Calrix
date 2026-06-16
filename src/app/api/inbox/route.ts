import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { inboxFilterSchema } from "@/server/module/inbox/get-inbox-email.schema";
import { getInboxList } from "@/server/module/inbox/get-inbox-list.service";

export const GET = createHandler({
  auth: true,
  rateLimit: "default",
  handler: async ({ req, user }) => {
    const sp = req.nextUrl.searchParams;
    const filter = inboxFilterSchema.catch("all").parse(sp.get("filter"));
    const pageToken = sp.get("pageToken") ?? undefined;

    const data = await getInboxList(user.id, filter, pageToken);
    return ok(data);
  },
});
