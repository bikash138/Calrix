import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { contactsRepo } from "@/server/module/contacts/contacts.repo";

export const GET = createHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    if (!q.trim()) return ok({ contacts: [] });

    const contacts = await contactsRepo.search(user.id, q, 6);
    return ok({ contacts });
  },
});
