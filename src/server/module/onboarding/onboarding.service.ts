import {
  DEFAULT_CALENDAR,
  DEFAULT_INBOX,
  type UserPreferences,
} from "@/server/db/schema/settings";
import type { OnboardingInput } from "./onboarding.schema";
import { onboardingRepo } from "./onboarding.repo";

export const onboardingService = {
  complete: async (userId: string, input: OnboardingInput): Promise<void> => {
    const preferences: UserPreferences = {
      inbox: {
        ...DEFAULT_INBOX,
        urgencySignals: input.urgencySignals,
        vipSenders: input.vipSenders,
      },
      calendar: DEFAULT_CALENDAR,
      ai: {
        role: input.role,
        roleOther: input.roleOther,
        volume: input.volume,
        summaryStyle: input.summaryStyle,
        followUpSensitivity: input.followUp,
        trainingOptOut: input.trainingOptOut,
      },
    };

    await onboardingRepo.complete(userId, preferences);
  },
};
