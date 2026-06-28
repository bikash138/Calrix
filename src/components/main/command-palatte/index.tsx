"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";
import Fuse from "fuse.js";
import {
  LayoutDashboard,
  Zap,
  Inbox,
  Calendar,
  Settings,
  Sun,
  Moon,
  LogOut,
  Search,
  ArrowUp,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import Image from "next/image";
import { LogoMark } from "@/assets/logo";
import { authClient } from "@/server/better-auth/client";
import { CommandDialog } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  useStreamingChat,
  getPendingUserInput,
} from "@/hooks/use-streaming-chat";
import {
  REQUEST_USER_INPUT_TOOL,
  type UserInputResult,
} from "@/lib/request-input.schema";
import { InputWidget } from "@/components/main/chat/input-widgets";
import { AiTab } from "./ai-tab";
import { SearchTab } from "./search-tab";

type Tab = "search" | "ai";

type CommandEntry = {
  id: string;
  label: string;
  group: "navigation" | "commands";
  keywords?: string[];
  icon: React.ElementType;
  shortcut?: string;
  danger?: boolean;
  action: () => void;
};

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [maximized, setMaximized] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, status, sendMessage, setMessages, addToolOutput } =
    useStreamingChat();
  const isStreaming = status === "submitted" || status === "streaming";
  const pending = getPendingUserInput(messages);

  function clearMessages() {
    setMessages([]);
  }

  function handleWidgetSubmit(result: UserInputResult) {
    if (!pending) return;
    addToolOutput({
      tool: REQUEST_USER_INPUT_TOOL,
      toolCallId: pending.toolCallId,
      output: result,
    });
  }

  function handleWidgetCancel() {
    if (!pending) return;
    addToolOutput({
      tool: REQUEST_USER_INPUT_TOOL,
      toolCallId: pending.toolCallId,
      output: { status: "custom", value: "(Let me type my answer instead.)" },
    });
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        if (activeTab === "ai") aiTextareaRef.current?.focus();
        else searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [open, activeTab]);

  function handleMaximize() {
    setMaximized((p) => !p);
    setResizing(true);
    setTimeout(() => setResizing(false), 380);
  }

  function close() {
    setOpen(false);
    setQuery("");
    setMaximized(false);
    clearMessages();
  }

  function navigate(href: string) {
    close();
    router.push(href);
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setQuery("");
  }

  function handleAISend() {
    if (!query.trim() || isStreaming || pending) return;
    sendMessage({ text: query });
    setQuery("");
    if (aiTextareaRef.current) aiTextareaRef.current.style.height = "auto";
  }

  useHotkeys("mod+k", () => setOpen((prev) => !prev), { preventDefault: true });
  useHotkeys("mod+shift+f", handleMaximize, {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
  });
  useHotkeys(
    "mod+/",
    () => {
      if (inputFocused) {
        if (activeTab === "ai") aiTextareaRef.current?.blur();
        else searchInputRef.current?.blur();
      } else {
        if (activeTab === "ai") aiTextareaRef.current?.focus();
        else searchInputRef.current?.focus();
      }
    },
    {
      enabled: open,
      preventDefault: true,
      enableOnFormTags: ["INPUT", "TEXTAREA"],
    },
    [inputFocused, activeTab],
  );
  useHotkeys("d", () => navigate("/chat"), {
    enabled: open && !query && activeTab === "search",
    preventDefault: true,
  });
  useHotkeys("a", () => navigate("/actions"), {
    enabled: open && !query && activeTab === "search",
    preventDefault: true,
  });
  useHotkeys("i", () => navigate("/inbox"), {
    enabled: open && !query && activeTab === "search",
    preventDefault: true,
  });
  useHotkeys("c", () => navigate("/calendar"), {
    enabled: open && !query && activeTab === "search",
    preventDefault: true,
  });
  useHotkeys("s", () => navigate("/settings"), {
    enabled: open && !query && activeTab === "search",
    preventDefault: true,
  });

  async function handleSignOut() {
    close();
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  }

  const items: CommandEntry[] = useMemo(
    () => [
      {
        id: "chat",
        label: "Chat",
        group: "navigation",
        shortcut: "D",
        keywords: ["home", "overview", "dashboard"],
        icon: LayoutDashboard,
        action: () => navigate("/chat"),
      },
      {
        id: "actions",
        label: "Actions",
        group: "navigation",
        shortcut: "A",
        keywords: ["tasks", "zap", "automations"],
        icon: Zap,
        action: () => navigate("/actions"),
      },
      {
        id: "inbox",
        label: "Inbox",
        group: "navigation",
        shortcut: "I",
        keywords: ["messages", "mail", "notifications"],
        icon: Inbox,
        action: () => navigate("/inbox"),
      },
      {
        id: "calendar",
        label: "Calendar",
        group: "navigation",
        shortcut: "C",
        keywords: ["events", "schedule", "dates"],
        icon: Calendar,
        action: () => navigate("/calendar"),
      },
      {
        id: "settings",
        label: "Settings",
        group: "navigation",
        shortcut: "S",
        keywords: ["preferences", "config", "account"],
        icon: Settings,
        action: () => navigate("/settings"),
      },
      {
        id: "theme",
        label:
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        group: "commands",
        keywords: ["dark", "light", "mode", "appearance", "theme"],
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          close();
        },
      },
      {
        id: "signout",
        label: "Sign Out",
        group: "commands",
        keywords: ["logout", "exit", "leave"],
        icon: LogOut,
        danger: true,
        action: handleSignOut,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["label", "keywords"],
        threshold: 0.35,
        includeScore: true,
      }),
    [items],
  );

  const results = query ? fuse.search(query).map((r) => r.item) : items;
  const navResults = results.filter((i) => i.group === "navigation");
  const cmdResults = results.filter((i) => i.group === "commands");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Calrix AI (⌘K)"
        className="fixed bottom-6 right-6 z-50 hidden h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-300 transition-all duration-200 hover:scale-105 active:scale-95 md:flex dark:from-orange-900/60 dark:to-orange-700/60"
      >
        <Image
          src="/icon.svg"
          alt="Calrix"
          width={28}
          height={28}
          className="rounded-sm"
        />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) close();
          else setOpen(true);
        }}
        title="Command Bar"
        description="Search for pages and commands"
        shouldFilter={false}
        className={cn(
          "border border-zinc-200 ring-0 bg-white backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/90 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-zinc-400 dark:**:[[cmdk-group-heading]]:text-zinc-500",
          // Open/close: spring drop-in, quick rise-out
          "data-[state=open]:[animation-name:palette-in] data-[state=open]:[animation-duration:280ms] data-[state=open]:[animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          "data-[state=closed]:[animation-name:palette-out] data-[state=closed]:[animation-duration:160ms] data-[state=closed]:[animation-timing-function:ease-in]",
          // Maximize/minimize: flash-cut with scale pulse
          resizing &&
            "[animation-name:palette-resize] animation-duration-[380ms] [animation-timing-function:ease-in-out]",
          maximized
            ? "w-screen h-screen max-w-none rounded-none!"
            : "w-[780px] max-w-[calc(100vw-2rem)]",
        )}
      >
        {/* Tab bar */}
        <div className="flex items-center border-b border-zinc-200 px-3 dark:border-white/10">
          <button
            onClick={() => switchTab("ai")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-2 py-2.5 -mb-px text-xs font-medium transition-colors",
              activeTab === "ai"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <LogoMark size={16} />
            Ask
          </button>
          <button
            onClick={() => switchTab("search")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-2 py-2.5 -mb-px text-xs font-medium transition-colors",
              activeTab === "search"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Search className="h-3 w-3" />
            Search
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-600">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">
                  ↩
                </kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">
                  ⌘
                </kbd>
                <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">
                  ⇧F
                </kbd>
                {maximized ? "minimize" : "maximize"}
              </span>
            </div>
            <div className="flex items-center gap-0.5 border-l border-zinc-200 pl-2 dark:border-white/10">
              <button
                onClick={handleMaximize}
                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/8 dark:hover:text-zinc-300"
              >
                {maximized ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={close}
                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/8 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nav strip — only in search mode */}
        <div
          className={cn(
            "flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3 dark:border-white/10",
            activeTab === "ai" && "hidden",
          )}
        >
          {items
            .filter((i) => i.group === "navigation")
            .map(({ id, label, shortcut, action }) => (
              <button
                key={id}
                onClick={action}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-zinc-100"
              >
                {label}
                {shortcut && (
                  <kbd className="rounded border border-zinc-300 px-1 py-px font-mono text-[10px] text-zinc-400 dark:border-zinc-600 dark:text-zinc-500">
                    {shortcut}
                  </kbd>
                )}
              </button>
            ))}
        </div>

        {/* Content area */}
        <div className={cn(maximized && "flex-1 min-h-0 overflow-hidden")}>
          {activeTab === "search" ? (
            <SearchTab
              navResults={navResults}
              cmdResults={cmdResults}
              maximized={maximized}
            />
          ) : (
            <AiTab
              messages={messages}
              isStreaming={isStreaming}
              maximized={maximized}
            />
          )}
        </div>

        {/* Input — bottom */}
        <div className="px-3 py-2">
          {activeTab === "ai" && pending ? (
            <InputWidget
              input={pending.input}
              onSubmit={handleWidgetSubmit}
              onCancel={handleWidgetCancel}
              disabled={isStreaming}
            />
          ) : (
            <div
              className={cn(
                "rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5",
                activeTab === "search"
                  ? "flex items-center gap-3"
                  : "flex items-end gap-2",
              )}
            >
              {activeTab === "search" ? (
                <>
                  <Search className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Search pages and commands..."
                    className="w-full bg-transparent py-0 text-[14px] leading-relaxed outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </>
              ) : (
                <>
                  <textarea
                    ref={aiTextareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        query.trim() &&
                        !isStreaming
                      ) {
                        e.preventDefault();
                        handleAISend();
                      }
                    }}
                    placeholder={
                      isStreaming
                        ? "AI is thinking…"
                        : "Ask Calrix…"
                    }
                    disabled={isStreaming}
                    rows={1}
                    style={{ maxHeight: maximized ? "200px" : "120px" }}
                    className="w-full resize-none overflow-y-auto bg-transparent py-0 text-[14px] leading-relaxed outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                  <button
                    onClick={handleAISend}
                    disabled={!query.trim() || isStreaming}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                      query.trim() && !isStreaming
                        ? "bg-blue-900 text-white hover:bg-blue-800"
                        : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
                    )}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </CommandDialog>
    </>
  );
}
