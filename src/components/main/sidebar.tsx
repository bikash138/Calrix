"use client";

import { useState, Suspense, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import BoltIcon from "@mui/icons-material/Bolt";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

function mkIcon(Icon: React.ElementType, name: string) {
  const C = ({ className }: { className?: string }) => (
    <Icon sx={{ fontSize: 16 }} className={className} />
  );
  C.displayName = name;
  return C;
}

const DashboardIcon = mkIcon(SpaceDashboardIcon, "DashboardIcon");
const ActionsIcon = mkIcon(BoltIcon, "ActionsIcon");
const InboxIcon = mkIcon(AllInboxIcon, "InboxIcon");
const CalendarIcon = mkIcon(CalendarMonthIcon, "CalendarIcon");
const SettingsNavIcon = mkIcon(SettingsIcon, "SettingsNavIcon");
const AccountIcon = mkIcon(PersonIcon, "AccountIcon");
const AIIcon = mkIcon(AutoAwesomeIcon, "AIIcon");
const ShortcutsIcon = mkIcon(KeyboardIcon, "ShortcutsIcon");
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "@/store/user.store";
import { usePreferencesStore } from "@/store/preferences.store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarMiniCalendar } from "./sidebar-mini-calendar";

const navItems = [
  { label: "Chat", href: "/chat", icon: DashboardIcon },
  { label: "Actions", href: "/actions", icon: ActionsIcon },
  { label: "Inbox", href: "/inbox", icon: InboxIcon },
  { label: "Calendar", href: "/calender", icon: CalendarIcon },
  { label: "Settings", href: "/settings", icon: SettingsNavIcon },
];

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: AccountIcon },
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "ai", label: "Calrix AI", icon: AIIcon },
  { id: "shortcuts", label: "Shortcuts", icon: ShortcutsIcon },
];

// Inner component — uses useSearchParams, must be wrapped in Suspense
function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(pathname === "/settings");

  const activeSection = searchParams.get("section") ?? "account";
  const calendarDefaultView = usePreferencesStore((s) => s.calendarDefaultView);
  const inboxDefaultView = usePreferencesStore((s) => s.inboxDefaultView);

  return (
    <SidebarMenu className="gap-0.5">
      {navItems.map(({ label, href, icon: Icon }) => {
        // Calendar — toggles mini calendar dropdown
        if (href === "/calender") {
          return (
            <SidebarMenuItem key={href}>
              <div className="flex items-center">
                <SidebarMenuButton
                  size="sm"
                  asChild
                  isActive={pathname === href}
                  className="flex-1"
                >
                  <Link href={`/calender?view=${calendarDefaultView}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>
                      {label}
                      {calendarOpen ? (
                        <ArrowDropDownIcon
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCalendarOpen(false);
                          }}
                          fontSize="small"
                          className="text-muted-foreground group-data-[collapsible=icon]:hidden"
                        />
                      ) : (
                        <ArrowRightIcon
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCalendarOpen(true);
                          }}
                          fontSize="small"
                          className="text-muted-foreground group-data-[collapsible=icon]:hidden"
                        />
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </div>
              {calendarOpen && (
                <div className="mt-1 px-1 pb-1 group-data-[collapsible=icon]:hidden">
                  <SidebarMiniCalendar />
                </div>
              )}
            </SidebarMenuItem>
          );
        }

        // Settings — toggles section sub-items dropdown
        if (href === "/settings") {
          return (
            <SidebarMenuItem key={href}>
              <div className="flex items-center">
                <SidebarMenuButton
                  size="sm"
                  asChild
                  isActive={pathname === href}
                  className="flex-1"
                >
                  <Link href="/settings?section=account">
                    <Icon className="h-3.5 w-3.5" />
                    <span>
                      {label}
                      {settingsOpen ? (
                        <ArrowDropDownIcon
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSettingsOpen(false);
                          }}
                          fontSize="small"
                          className="text-muted-foreground group-data-[collapsible=icon]:hidden"
                        />
                      ) : (
                        <ArrowRightIcon
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSettingsOpen(true);
                          }}
                          fontSize="small"
                          className="text-muted-foreground group-data-[collapsible=icon]:hidden"
                        />
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </div>
              {settingsOpen && (
                <div className="mt-0.5 mb-0.5 group-data-[collapsible=icon]:hidden">
                  {SETTINGS_SECTIONS.map(
                    ({ id, label: sLabel, icon: SIcon }) => (
                      <Link
                        key={id}
                        href={`/settings?section=${id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md py-1 pl-7 pr-2 text-[0.73rem] transition-colors",
                          pathname === "/settings" && activeSection === id
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <SIcon className="h-3 w-3 shrink-0" />
                        {sLabel}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </SidebarMenuItem>
          );
        }

        const resolvedHref =
          href === "/inbox" ? `/inbox?filter=${inboxDefaultView}` : href;

        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              size="sm"
              asChild
              isActive={pathname === href}
              tooltip={label}
            >
              <Link href={resolvedHref}>
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const user = useUserStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const confirmSignOut = useCallback(async () => {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  }, [router]);

  return (
    <>
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mx-0 mb-0 gap-3 border-0 bg-transparent p-0 sm:gap-3">
            <button
              onClick={() => setSignOutOpen(false)}
              className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmSignOut}
              disabled={signingOut}
              className="cursor-pointer rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sidebar
        collapsible="icon"
        variant="inset"
        className="border-r-0 hidden md:flex"
      >
        <SidebarHeader className="p-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="group-data-[collapsible=icon]:p-1!"
              >
                <div className="flex items-center gap-2">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "User"}
                      width={22}
                      height={22}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="truncate text-xs font-medium text-foreground">
                    {user?.name ?? "User"}
                  </span>
                  {clock && (
                    <span className="ml-auto shrink-0 text-[0.62rem] tabular-nums text-muted-foreground group-data-[collapsible=icon]:hidden">
                      {clock}
                    </span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="p-1">
            <SidebarGroupContent>
              <Suspense>
                <SidebarNav />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                tooltip="Toggle theme"
                className="cursor-pointer"
              >
                <Brightness6Icon sx={{ fontSize: 16 }} />
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                onClick={() => setSignOutOpen(true)}
                tooltip="Sign out"
                className="cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
