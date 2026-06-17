import { create } from "zustand";
import type {
  UserPreferences,
  InboxView,
  CalendarView,
  WeekStart,
  WorkdayStart,
  WorkdayEnd,
} from "@/server/db/schema/settings";
import { DEFAULT_PREFERENCES } from "@/server/db/schema/settings";

export type UIPreferences = {
  inboxDefaultView: InboxView;
  calendarDefaultView: CalendarView;
  weekStartsOn: WeekStart;
  workdayStart: WorkdayStart;
  workdayEnd: WorkdayEnd;
};

type PreferencesStore = UIPreferences & {
  hydrate: (prefs: UserPreferences) => void;
};

const extractUI = (prefs: UserPreferences): UIPreferences => ({
  inboxDefaultView: prefs.inbox.defaultView,
  calendarDefaultView: prefs.calendar.defaultView,
  weekStartsOn: prefs.calendar.weekStartsOn,
  workdayStart: prefs.calendar.workdayStart,
  workdayEnd: prefs.calendar.workdayEnd,
});

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  ...extractUI(DEFAULT_PREFERENCES),
  hydrate: (prefs) => set(extractUI(prefs)),
}));
