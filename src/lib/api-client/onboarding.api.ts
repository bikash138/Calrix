import type { OnboardingInput } from "@/server/module/onboarding/onboarding.schema";
import { apiClient } from "./axios";

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export const onboardingApi = {
  complete: async (payload: OnboardingInput): Promise<ApiResponse<{ completedOnboarding: true }>> => {
    const { data } = await apiClient.post<ApiResponse<{ completedOnboarding: true }>>(
      "/api/onboarding",
      payload,
    );
    return data;
  },
};
