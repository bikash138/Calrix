import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { preferencesSchema } from "@/server/module/settings/settings.schema";
import { settingsService } from "@/server/module/settings/settings.service";

export const GET = createHandler({
  auth: true,
  handler: async ({ user }) => {
    const prefs = await settingsService.getAll(user.id);
    return ok(prefs);
  },
});

export const PATCH = createHandler({
  auth: true,
  schema: preferencesSchema,
  handler: async ({ user, body }) => {
    const prefs = await settingsService.update(user.id, body);
    return ok(prefs);
  },
});
