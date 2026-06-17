"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/main/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CommandBar } from "@/components/main/command-palatte";
import {
  TopBarExtrasLeft,
  TopBarExtrasRight,
} from "@/components/main/top-bar-extras";
import { MobileBottomNav } from "@/components/main/mobile-bottom-nav";
import { ACTIONS_QUERY_KEY } from "@/components/main/actions-count-provider";
import { WorkspaceProviders } from "@/components/providers/workspace";
import {
  LoadingScreen,
  type LoadingStep,
} from "@/components/main/loading-screen";
import { authApi } from "@/lib/api-client/auth.api";
import { settingsApi } from "@/lib/api-client/settings.api";
import { actionsApi } from "@/lib/api-client/actions.api";
import { onboardingApi } from "@/lib/api-client/onboarding.api";
import { ActionStatus } from "@/server/db/schema/triage";
import type { OnboardingInput } from "@/server/module/onboarding/onboarding.schema";
import type { auth } from "@/server/better-auth/auth";
import type { UserPreferences } from "@/server/db/schema/settings";

type AppUser = typeof auth.$Infer.Session.user;

type InitData = {
  user: AppUser;
  preferences: UserPreferences;
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SIGNED_IN_STEPS: LoadingStep[] = [
  { label: "Setting up the user...", done: false },
  { label: "Connecting to the workspace...", done: false },
  { label: "All done, preparing the dashboard...", done: false },
];

const ONBOARDING_STEPS: LoadingStep[] = [
  { label: "Saving your preferences...", done: false },
  { label: "Setting up the user...", done: false },
  { label: "Connecting to the workspace...", done: false },
  { label: "All done, preparing the dashboard...", done: false },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const qc = useQueryClient();
  const pathname = usePathname();
  const ranRef = useRef(false);

  const [steps, setSteps] = useState<LoadingStep[]>([]);
  const [initData, setInitData] = useState<InitData | null>(null);
  const [isReady, setIsReady] = useState(false);

  const markDone = (index: number) =>
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, done: true } : s)),
    );

  const updateLabel = (index: number, label: string) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, label } : s)));

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      const onboardingRaw = sessionStorage.getItem("calrix_onboarding");
      const hasOnboarding = !!onboardingRaw;

      setSteps(hasOnboarding ? [...ONBOARDING_STEPS] : [...SIGNED_IN_STEPS]);

      let idx = 0;

      // Step 1 (new users only): save preferences
      if (hasOnboarding) {
        const formData = JSON.parse(onboardingRaw) as OnboardingInput;
        await Promise.all([onboardingApi.complete(formData), delay(1000)]);
        sessionStorage.removeItem("calrix_onboarding");
        document.cookie = "onboarding_pending=; path=/; max-age=0";
        markDone(idx++);
      }

      // Step: session
      const [sessionRes] = await Promise.all([
        authApi.getSession(),
        delay(1000),
      ]);
      qc.setQueryData(["session"], sessionRes);
      markDone(idx++);

      // Personalise the last step now that we have the name
      const firstName = sessionRes!.user.name?.split(" ")[0] ?? "there";
      const lastIdx = hasOnboarding ? 3 : 2;
      updateLabel(
        lastIdx,
        hasOnboarding
          ? `Hi ${firstName}, your workspace is all set!`
          : `Welcome back ${firstName}!`,
      );

      // Step: settings
      const [settingsRes] = await Promise.all([
        settingsApi.getAll(),
        delay(1000),
      ]);
      qc.setQueryData(["settings"], settingsRes);
      markDone(idx++);

      // Step: actions
      const [actions] = await Promise.all([
        actionsApi.getAll(ActionStatus.PENDING),
        delay(1000),
      ]);
      qc.setQueryData(ACTIONS_QUERY_KEY, actions);
      markDone(idx++);

      setInitData({ user: sessionRes!.user, preferences: settingsRes.data });
    };

    run().catch(() => {
      setSteps((prev) => {
        const failedIdx = prev.findIndex((s) => !s.done && !s.error);
        const target = failedIdx === -1 ? 0 : failedIdx;
        return prev.map((s, i) =>
          i === target
            ? { ...s, error: true, label: "Please sign in again" }
            : s,
        );
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady || !initData) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
      >
        <div className="h-screen w-full">
          <LoadingScreen steps={steps} onComplete={() => setIsReady(true)} />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <WorkspaceProviders
        user={initData.user}
        preferences={initData.preferences}
      >
        <SidebarProvider
          className="h-screen overflow-hidden"
          style={
            {
              fontFamily: "var(--font-inter)",
              fontWeight: "500",
              "--sidebar-width": "13rem",
              "--sidebar-width-icon": "2rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="m-1 overflow-hidden rounded-lg border border-border bg-card text-foreground">
            <div className="flex shrink-0 items-center px-2 py-1">
              <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-foreground" />
              <TopBarExtrasLeft />
              <div className="ml-auto flex items-center gap-2">
                <TopBarExtrasRight />
                {pathname !== "/chat" && <CommandBar />}
              </div>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              {children}
            </div>
            <MobileBottomNav />
          </SidebarInset>
        </SidebarProvider>
      </WorkspaceProviders>
    </ThemeProvider>
  );
}
