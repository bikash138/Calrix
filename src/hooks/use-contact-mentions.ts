"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { contactsApi, type ContactMatch } from "@/lib/api-client/contacts.api";

type Range = { start: number; end: number };

/**
 * "@mention" support for a chat textarea. Detects an `@query` before the caret,
 * fetches matching contacts, handles keyboard navigation, and inserts the picked
 * contact inline as `Name <email>` so the AI receives the address directly.
 */
export function useContactMentions(opts: {
  value: string;
  setValue: (v: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const { value, setValue, textareaRef } = opts;

  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContactMatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const rangeRef = useRef<Range | null>(null);
  const reqId = useRef(0);

  const close = useCallback(() => {
    setActive(false);
    setResults([]);
    setActiveIndex(0);
    rangeRef.current = null;
  }, []);

  /** Recompute mention state from the current value + caret position. */
  const sync = useCallback(
    (nextValue: string, caret: number) => {
      const before = nextValue.slice(0, caret);
      const m = before.match(/(^|\s)@([^\s@]*)$/);
      if (!m) {
        close();
        return;
      }
      const at = (m.index ?? 0) + m[1].length; // index of "@"
      rangeRef.current = { start: at, end: caret };
      setQuery(m[2]);
      setActive(true);
      setActiveIndex(0);
    },
    [close],
  );

  // Debounced fetch while a mention is active.
  useEffect(() => {
    if (!active || query.length < 1) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const contacts = await contactsApi.search(query);
        if (id === reqId.current) {
          setResults(contacts);
          setActiveIndex(0);
        }
      } catch {
        if (id === reqId.current) setResults([]);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [active, query]);

  const select = useCallback(
    (item: ContactMatch) => {
      const range = rangeRef.current;
      if (!range) return;
      const insert = `${item.email} `;
      const next =
        value.slice(0, range.start) + insert + value.slice(range.end);
      setValue(next);
      const caret = range.start + insert.length;
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(caret, caret);
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      });
      close();
    },
    [value, setValue, textareaRef, close],
  );

  // Filter stale results out during render rather than clearing state in an effect.
  const visibleResults = useMemo(
    () => (active && query.length >= 1 ? results : []),
    [active, query, results],
  );
  const open = active && visibleResults.length > 0;

  /** Returns true if the key was consumed by the mention dropdown. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!open) return false;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % visibleResults.length);
          return true;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            (i) => (i - 1 + visibleResults.length) % visibleResults.length,
          );
          return true;
        case "Enter":
        case "Tab":
          e.preventDefault();
          select(visibleResults[activeIndex]);
          return true;
        case "Escape":
          e.preventDefault();
          close();
          return true;
        default:
          return false;
      }
    },
    [open, visibleResults, activeIndex, select, close],
  );

  return {
    open,
    results: visibleResults,
    activeIndex,
    setActiveIndex,
    sync,
    handleKeyDown,
    select,
    close,
  };
}
