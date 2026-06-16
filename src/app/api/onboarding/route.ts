import { createHandler } from "@/server/api/request-pipeline";
import { ok } from "@/server/api/response";
import { onboardingSchema } from "@/server/module/onboarding/onboarding.schema";
import { onboardingService } from "@/server/module/onboarding/onboarding.service";

export const POST = createHandler({
  auth: true,
  schema: onboardingSchema,
  handler: async ({ user, body }) => {
    await onboardingService.complete(user.id, body);
    return ok({ completedOnboarding: true });
  },
});
