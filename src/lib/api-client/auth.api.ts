import { authClient } from "@/server/better-auth/client";

export const authApi = {
  getSession: async () => {
    const { data } = await authClient.getSession();
    return data;
  },
};
