"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { inboxApi } from "@/lib/api-client/inbox.api";
import { useInboxNavigation } from "@/hooks/use-inbox";
import { SenderAvatar } from "./sender-avatar";
import { formatTime } from "@/lib/inbox-utils";
import type { ThreadRow } from "@/lib/api-client/inbox.api";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function InboxSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { navigateToThread } = useInboxNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["inbox-search", debouncedQuery],
    queryFn: () => inboxApi.searchThreads(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Focus search on "/" shortcut dispatched from useInboxKeyboard
  useEffect(() => {
    function onFocusSearch() {
      inputRef.current?.focus();
      setOpen(true);
    }
    window.addEventListener("calrix:focus-search", onFocusSearch);
    return () =>
      window.removeEventListener("calrix:focus-search", onFocusSearch);
  }, []);

  function handleSelect(thread: ThreadRow) {
    navigateToThread(thread.id);
    setOpen(false);
    setQuery("");
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  const showDropdown = open && debouncedQuery.trim().length > 1;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1 transition-all duration-200",
          open
            ? "w-64 border-indigo-300 bg-background ring-2 ring-indigo-100 dark:border-indigo-700 dark:ring-indigo-950/50"
            : "w-44 border-border hover:border-muted-foreground/30",
        )}
      >
        {isFetching && debouncedQuery.length > 1 ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground/50" />
        ) : (
          <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Search mail…"
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
        {query ? (
          <button onClick={handleClear} className="shrink-0 cursor-pointer">
            <X className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground" />
          </button>
        ) : (
          <kbd className="shrink-0 rounded border border-border bg-muted px-1 py-px font-mono text-[9px] text-muted-foreground/40">
            /
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-88 overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {isFetching ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
              <p className="text-[10px] text-muted-foreground">
                Searching for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Search className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  No results
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Nothing matched &ldquo;{debouncedQuery}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-border px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {results.length} result{results.length !== 1 ? "s" : ""} for
                  &ldquo;{debouncedQuery}&rdquo;
                </p>
              </div>
              <div className="py-1">
                {results.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => handleSelect(thread)}
                    className="group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors duration-100 hover:bg-accent"
                  >
                    <SenderAvatar
                      name={thread.senderName}
                      className="mt-0.5 h-7 w-7 shrink-0 text-[10px]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-xs",
                            thread.unread
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/70",
                          )}
                        >
                          {thread.senderName}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatTime(thread.date)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "truncate text-[11px]",
                          thread.unread
                            ? "font-medium text-foreground"
                            : "text-foreground/70",
                        )}
                      >
                        {thread.subject}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground/60">
                        {thread.snippet}
                      </p>
                    </div>
                    {thread.unread && (
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-border px-3 py-2">
                <p className="text-[9px] text-muted-foreground/50">
                  <kbd className="rounded border border-border bg-muted px-1 py-px font-mono">
                    ↩
                  </kbd>{" "}
                  to open ·{" "}
                  <kbd className="rounded border border-border bg-muted px-1 py-px font-mono">
                    Esc
                  </kbd>{" "}
                  to close · Gmail syntax supported
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
