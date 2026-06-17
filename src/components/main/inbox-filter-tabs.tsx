"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, type Variants } from "motion/react";
import {
  Inbox,
  RefreshCw,
  Star,
  Send,
  Trash2,
  RotateCw,
  Keyboard,
  MoreHorizontal,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInboxNavigation } from "@/hooks/use-inbox";

type FilterId = "all" | "unread" | "starred" | "sent" | "trash";

const FILTERS: {
  id: FilterId;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  activeBtn: string;
  hoverBtn: string;
  iconActive: string;
  iconDefault: string;
  iconHoverColor: string;
  kbdActive: string;
}[] = [
  {
    id: "all",
    label: "All mail",
    icon: Inbox,
    shortcut: "1",
    activeBtn:
      "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    hoverBtn:
      "hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400",
    iconActive: "text-indigo-600 dark:text-indigo-400",
    iconDefault: "text-muted-foreground/60",
    iconHoverColor:
      "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    kbdActive:
      "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-400",
  },
  {
    id: "unread",
    label: "Unread",
    icon: RefreshCw,
    shortcut: "2",
    activeBtn:
      "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    hoverBtn:
      "hover:border-violet-200 hover:bg-violet-50/70 hover:text-violet-600 dark:hover:border-violet-800 dark:hover:bg-violet-950/30 dark:hover:text-violet-400",
    iconActive: "text-violet-600 dark:text-violet-400",
    iconDefault: "text-muted-foreground/60",
    iconHoverColor:
      "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    kbdActive:
      "bg-violet-100 text-violet-500 dark:bg-violet-900/50 dark:text-violet-400",
  },
  {
    id: "starred",
    label: "Starred",
    icon: Star,
    shortcut: "3",
    activeBtn:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    hoverBtn:
      "hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-600 dark:hover:border-amber-800 dark:hover:bg-amber-950/30 dark:hover:text-amber-400",
    iconActive: "fill-amber-400 text-amber-500 dark:text-amber-400",
    iconDefault: "text-muted-foreground/60",
    iconHoverColor:
      "group-hover:fill-amber-300 group-hover:text-amber-500 dark:group-hover:text-amber-400",
    kbdActive:
      "bg-amber-100 text-amber-500 dark:bg-amber-900/50 dark:text-amber-400",
  },
  {
    id: "sent",
    label: "Sent",
    icon: Send,
    shortcut: "4",
    activeBtn:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    hoverBtn:
      "hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-600 dark:hover:border-sky-800 dark:hover:bg-sky-950/30 dark:hover:text-sky-400",
    iconActive: "text-sky-600 dark:text-sky-400",
    iconDefault: "text-muted-foreground/60",
    iconHoverColor: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
    kbdActive: "bg-sky-100 text-sky-500 dark:bg-sky-900/50 dark:text-sky-400",
  },
  {
    id: "trash",
    label: "Trash",
    icon: Trash2,
    shortcut: "5",
    activeBtn:
      "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    hoverBtn:
      "hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400",
    iconActive: "text-rose-600 dark:text-rose-400",
    iconDefault: "text-muted-foreground/60",
    iconHoverColor: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    kbdActive:
      "bg-rose-100 text-rose-500 dark:bg-rose-900/50 dark:text-rose-400",
  },
];

// Variants keyed to "iconHover" — propagated from the parent button's whileHover
const ICON_VARIANTS: Record<FilterId, Variants> = {
  all: {
    iconHover: {
      y: -3,
      scale: 1.25,
      transition: { type: "spring", stiffness: 500, damping: 12 },
    },
  },
  unread: {
    iconHover: {
      rotate: 180,
      scale: 1.1,
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    },
  },
  starred: {
    iconHover: {
      scale: 1.35,
      rotate: 20,
      transition: { type: "spring", stiffness: 350, damping: 8 },
    },
  },
  sent: {
    iconHover: {
      x: 4,
      y: -4,
      scale: 1.1,
      transition: { type: "spring", stiffness: 450, damping: 14 },
    },
  },
  trash: {
    iconHover: {
      rotate: [0, -12, 12, -8, 8, 0],
      scale: 1.15,
      transition: { duration: 0.45 },
    },
  },
};

export function InboxFilterTabs() {
  const { filter, setFilter } = useInboxNavigation();
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    setSpinning(true);
    await queryClient.invalidateQueries({ queryKey: ["inbox", filter] });
    setSpinning(false);
  }, [queryClient, filter]);

  useEffect(() => {
    const handler = () => void handleRefresh();
    window.addEventListener("calrix:refresh", handler);
    return () => window.removeEventListener("calrix:refresh", handler);
  }, [handleRefresh]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!mobileDropdownRef.current?.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function handleShowShortcuts() {
    window.dispatchEvent(new CustomEvent("calrix:show-shortcuts"));
  }

  const activeFilter = FILTERS.find((f) => f.id === filter)!;
  const RefreshButton = (
    <motion.button
      onClick={handleRefresh}
      disabled={spinning}
      whileHover="iconHover"
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className="group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
    >
      <motion.span
        variants={{
          iconHover: !spinning
            ? {
                rotate: 180,
                scale: 1.2,
                transition: { type: "spring", stiffness: 300, damping: 12 },
              }
            : {},
        }}
        animate={spinning ? { rotate: 360 } : undefined}
        transition={
          spinning
            ? { duration: 0.7, repeat: Infinity, ease: "linear" }
            : undefined
        }
        className="shrink-0"
      >
        <RotateCw className="h-3 w-3" />
      </motion.span>
      <span className="hidden md:inline">Refresh</span>
      <kbd className="hidden md:inline ml-0.5 rounded bg-emerald-100 px-1 py-px font-mono text-[9px] text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-500">
        ⇧R
      </kbd>
    </motion.button>
  );

  return (
    <>
      {/* ── Mobile (below md) ── */}
      <div
        ref={mobileDropdownRef}
        className="relative flex items-center gap-1.5 md:hidden"
      >
        {/* Active filter badge */}
        {(() => {
          const { icon: Icon, label, activeBtn, iconActive } = activeFilter;
          return (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
                activeBtn,
              )}
            >
              <Icon className={cn("h-3 w-3", iconActive)} />
              {label}
            </span>
          );
        })()}

        {RefreshButton}

        {/* ... button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={cn(
            "flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            mobileOpen && "bg-accent text-foreground",
          )}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown */}
        {mobileOpen && (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
            <div className="py-1">
              {FILTERS.map(
                ({
                  id,
                  label,
                  icon: Icon,
                  iconActive,
                  iconDefault,
                  activeBtn,
                }) => {
                  const isActive = filter === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setFilter(id);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? iconActive : iconDefault,
                        )}
                      />
                      {label}
                      {isActive && (
                        <Check className="ml-auto h-3 w-3 text-indigo-500" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
            <div className="border-t border-border py-1">
              <button
                onClick={() => {
                  handleShowShortcuts();
                  setMobileOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts
                <kbd className="ml-auto rounded bg-muted px-1 py-px font-mono text-[9px] text-muted-foreground/60">
                  ?
                </kbd>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop (md and above) ── */}
      <div className="hidden items-center gap-1.5 px-2 md:flex">
        {FILTERS.map(
          ({
            id,
            label,
            icon: Icon,
            shortcut,
            activeBtn,
            hoverBtn,
            iconActive,
            iconDefault,
            iconHoverColor,
            kbdActive,
          }) => {
            const isActive = filter === id;
            return (
              <motion.button
                key={id}
                onClick={() => setFilter(id)}
                whileHover="iconHover"
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className={cn(
                  "group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                  isActive
                    ? activeBtn
                    : cn(
                        "border-border text-muted-foreground dark:border-white/10",
                        hoverBtn,
                      ),
                )}
              >
                <motion.span variants={ICON_VARIANTS[id]} className="shrink-0">
                  <Icon
                    className={cn(
                      "h-3 w-3 transition-colors duration-150",
                      isActive ? iconActive : cn(iconDefault, iconHoverColor),
                    )}
                  />
                </motion.span>
                {label}
                <kbd
                  className={cn(
                    "ml-0.5 rounded px-1 py-px font-mono text-[9px] transition-colors duration-150",
                    isActive ? kbdActive : "bg-muted text-muted-foreground/50",
                  )}
                >
                  {shortcut}
                </kbd>
              </motion.button>
            );
          },
        )}

        {/* Refresh */}
        <motion.button
          onClick={handleRefresh}
          disabled={spinning}
          whileHover="iconHover"
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="group ml-1 flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
        >
          <motion.span
            variants={{
              iconHover: !spinning
                ? {
                    rotate: 180,
                    scale: 1.2,
                    transition: { type: "spring", stiffness: 300, damping: 12 },
                  }
                : {},
            }}
            animate={spinning ? { rotate: 360 } : undefined}
            transition={
              spinning
                ? { duration: 0.7, repeat: Infinity, ease: "linear" }
                : undefined
            }
            className="shrink-0"
          >
            <RotateCw className="h-3 w-3" />
          </motion.span>
          Refresh
          <kbd className="ml-0.5 rounded bg-emerald-100 px-1 py-px font-mono text-[9px] text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-500">
            ⇧R
          </kbd>
        </motion.button>

        {/* Shortcuts */}
        <motion.button
          onClick={handleShowShortcuts}
          whileHover="iconHover"
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-600 dark:border-white/10 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
        >
          <motion.span
            variants={{
              iconHover: {
                rotate: -15,
                scale: 1.2,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              },
            }}
            className="shrink-0"
          >
            <Keyboard className="h-3 w-3" />
          </motion.span>
          <kbd className="rounded bg-muted px-1 py-px font-mono text-[9px] text-muted-foreground/60">
            ?
          </kbd>
        </motion.button>
      </div>
    </>
  );
}
