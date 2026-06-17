import { create } from "zustand";
import type { auth } from "@/server/better-auth/auth";

type AppUser = typeof auth.$Infer.Session.user;

type UserStore = AppUser & {
  hydrate: (user: AppUser) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  id: "",
  name: "",
  email: "",
  emailVerified: false,
  image: null,
  completedOnboarding: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  hydrate: (user) => set(user),
}));

if (process.env.NODE_ENV === "development") {
  useUserStore.subscribe((state, prev) => {
    const { hydrate: _a, ...next } = state;
    const { hydrate: _b, ...before } = prev;
    console.log("[UserStore]", { prev: before, next });
  });
}
