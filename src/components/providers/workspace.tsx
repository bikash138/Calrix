"use client";

import { useEffect } from "react";
import type { auth } from "@/server/better-auth/auth";
import type { UserPreferences } from "@/server/db/schema/settings";
import { useUserStore } from "@/store/user.store";
import { usePreferencesStore } from "@/store/preferences.store";

type AppUser = typeof auth.$Infer.Session.user;

export function WorkspaceProviders({
  user,
  preferences,
  children,
}: {
  user: AppUser;
  preferences: UserPreferences;
  children: React.ReactNode;
}) {
  const hydrateUser = useUserStore((s) => s.hydrate);
  const hydratePrefs = usePreferencesStore((s) => s.hydrate);

  useEffect(() => {
    hydrateUser(user);
    hydratePrefs(preferences);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
