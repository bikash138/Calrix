"use client";

import { useEffect } from "react";
import type { UserPreferences } from "@/server/db/schema/settings";
import { usePreferencesStore } from "@/store/preferences.store";

export function PreferencesHydrator({ preferences }: { preferences: UserPreferences }) {
  const hydrate = usePreferencesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(preferences);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
