import { createHandler } from "@/server/api/request-pipeline";
import { noContent } from "@/server/api/response";
import { accountService } from "@/server/module/account/account.service";

export const DELETE = createHandler({
  auth: true,
  rateLimit: "strict",
  handler: async ({ user }) => {
    await accountService.deleteAccount(user.id);
    return noContent();
  },
});
