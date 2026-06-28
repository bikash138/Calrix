"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Inbox,
  Calendar,
  Settings,
  User,
  Bell,
  Sparkles,
  Palette,
  Keyboard,
  ChevronUp,
  LogOut,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/server/better-auth/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/chat",
    label: "Chat",
    icon: LayoutDashboard,
    activeColor: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-950/60",
    dot: "bg-violet-500",
  },
  {
    href: "/actions",
    label: "Actions",
    icon: Zap,
    activeColor: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50 dark:bg-amber-950/60",
    dot: "bg-amber-500",
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: Inbox,
    activeColor: "text-indigo-600 dark:text-indigo-400",
    activeBg: "bg-indigo-50 dark:bg-indigo-950/60",
    dot: "bg-indigo-500",
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
    activeColor: "text-sky-600 dark:text-sky-400",
    activeBg: "bg-sky-50 dark:bg-sky-950/60",
    dot: "bg-sky-500",
  },
];

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

function SettingsDrawer({ onSelect }: { onSelect: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const activeSection = searchParams.get("section") ?? "account";

  async function handleSignOut() {
    onSelect();
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 w-52 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="px-3 pt-3 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Settings
        </p>
      </div>
      <div className="py-1">
        {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <Link
              key={id}
              href={`/settings?section=${id}`}
              onClick={onSelect}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-colors duration-100",
                isActive
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-muted-foreground/60",
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Theme toggle + sign out — only surfaced here on mobile */}
      <div className="border-t border-border/60 py-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors duration-100 hover:bg-accent hover:text-foreground"
        >
          <SunMoon
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
            strokeWidth={1.8}
          />
          <span className="flex-1 text-left">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-medium text-rose-600 transition-colors duration-100 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSettings = pathname.startsWith("/settings");

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const drawerOpen = settingsOpen && onSettings;

  function handleSettingsClick() {
    if (!onSettings) {
      router.push("/settings");
      return;
    }
    setSettingsOpen((v) => !v);
  }

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center md:hidden">
      <div
        ref={containerRef}
        className="relative flex items-center gap-0.5 rounded-2xl border border-border/60 bg-background/90 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl"
      >
        {/* Settings drawer — opens upward from the pill */}
        {drawerOpen && (
          <Suspense>
            <SettingsDrawer onSelect={() => setSettingsOpen(false)} />
          </Suspense>
        )}

        {/* Regular nav links */}
        {NAV_ITEMS.map(
          ({ href, label, icon: Icon, activeColor, activeBg, dot }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                title={label}
                onClick={() => setSettingsOpen(false)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-150",
                  isActive
                    ? cn(activeBg, activeColor)
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isActive && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full",
                      dot,
                    )}
                  />
                )}
              </Link>
            );
          },
        )}

        {/* Settings button — toggles the upward drawer */}
        <button
          onClick={handleSettingsClick}
          aria-label="Settings"
          title="Settings"
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-150 cursor-pointer",
            onSettings
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {drawerOpen ? (
            <ChevronUp className="h-[18px] w-[18px]" strokeWidth={2.2} />
          ) : (
            <Settings
              className="h-[18px] w-[18px]"
              strokeWidth={onSettings ? 2.2 : 1.8}
            />
          )}
          {onSettings && !drawerOpen && (
            <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>
    </div>
  );
}
