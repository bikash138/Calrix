"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePreferencesStore } from "@/store/preferences.store";
import { settingsApi } from "@/lib/api-client/settings.api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_TIMEZONE,
  type InboxSettings,
  type CalendarSettings,
  type AISettings,
  type UserPreferences,
} from "@/server/db/schema/settings";
import { AccountSection } from "@/components/main/settings/account-section";
import { InboxSection } from "@/components/main/settings/inbox-section";
import { AISection } from "@/components/main/settings/ai-section";
import { CalendarSection } from "@/components/main/settings/calendar-section";
import { ShortcutsSection } from "@/components/main/settings/shortcuts-section";

type SectionId = "account" | "inbox" | "ai" | "calendar" | "shortcuts";

const SECTION_META: Record<SectionId, { title: string; description?: string }> =
  {
    account: {
      title: "Account",
      description: "Manage your profile and connected services.",
    },
    inbox: {
      title: "Inbox",
      description: "Customize how your inbox looks and behaves.",
    },
    ai: {
      title: "Calrix AI",
      description: "Control how Calrix works for you.",
    },
    calendar: {
      title: "Calendar",
      description: "Configure how your calendar displays and behaves.",
    },
    shortcuts: {
      title: "Keyboard Shortcuts",
      description:
        "Inbox shortcuts are active on the inbox page. Global shortcuts work anywhere.",
    },
  };

function SettingsContent() {
  const searchParams = useSearchParams();
  const section = (searchParams.get("section") ?? "account") as SectionId;
  const meta = SECTION_META[section];

  const qc = useQueryClient();
  const { data: settingsRes } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
  const [isSaving, setIsSaving] = useState(false);

  const [inboxForm, setInboxForm] = useState<InboxSettings>(
    () =>
      settingsRes?.data.inbox ?? {
        defaultView: "all",
        signature: "",
        urgencySignals: [],
        vipSenders: [],
      },
  );
  const [calendarForm, setCalendarForm] = useState<CalendarSettings>(
    () =>
      settingsRes?.data.calendar ?? {
        defaultView: "month",
        weekStartsOn: "sunday",
        workdayStart: "09:00",
        workdayEnd: "18:00",
        meetingBuffer: "30min",
        timezone: DEFAULT_TIMEZONE,
      },
  );
  const [aiForm, setAIForm] = useState<AISettings>(
    () =>
      settingsRes?.data.ai ?? {
        summaryStyle: "brief",
        followUpSensitivity: "balanced",
        trainingOptOut: false,
        role: "casual",
        roleOther: "",
        volume: null,
      },
  );

  const patchInbox = (patch: Partial<InboxSettings>) =>
    setInboxForm((prev) => ({ ...prev, ...patch }));
  const patchCalendar = (patch: Partial<CalendarSettings>) =>
    setCalendarForm((prev) => ({ ...prev, ...patch }));
  const patchAI = (patch: Partial<AISettings>) =>
    setAIForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const preferences: UserPreferences = {
        inbox: inboxForm,
        calendar: calendarForm,
        ai: aiForm,
      };
      const res = await settingsApi.update(preferences);
      qc.setQueryData(["settings"], res);
      usePreferencesStore.getState().hydrate(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      {/* Sticky header */}
      <div className="shrink-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-orange-300/50 after:to-transparent">
        <div className="mx-auto flex max-w-xl items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {meta.title}
            </h2>
            {meta.description && (
              <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                {meta.description}
              </p>
            )}
          </div>
          {section !== "shortcuts" && section !== "account" && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-orange-500 text-white hover:bg-orange-600 text-[0.72rem]"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-8 py-7">
          {section === "account" && <AccountSection />}
          {section === "inbox" && (
            <InboxSection form={inboxForm} onChange={patchInbox} />
          )}
          {section === "ai" && <AISection form={aiForm} onChange={patchAI} />}
          {section === "calendar" && (
            <CalendarSection form={calendarForm} onChange={patchCalendar} />
          )}
          {section === "shortcuts" && <ShortcutsSection />}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <Suspense>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
