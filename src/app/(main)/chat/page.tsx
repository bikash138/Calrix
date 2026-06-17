"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUp, Trash2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { authClient } from "@/server/better-auth/client";
import { LogoMark } from "@/assets/logo";
import {
  useStreamingChat,
  getMessageText,
  getPendingUserInput,
  REQUEST_INPUT_PART_TYPE,
} from "@/hooks/use-streaming-chat";
import { InputWidget } from "@/components/main/chat/input-widgets";
import { useContactMentions } from "@/hooks/use-contact-mentions";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { MAX_MESSAGES } from "@/store/chat.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  REQUEST_USER_INPUT_TOOL,
  type UserInputResult,
} from "@/lib/request-input.schema";

const WARN_AT = 16;

const EXAMPLES = [
  "What meetings do I have today?",
  "Summarize my unread emails",
  "Schedule a focus block tomorrow morning",
  "Any urgent emails I need to reply to?",
];

const THINKING_PHRASES = [
  "hmm…",
  "let me think…",
  "on it…",
  "give me a sec…",
  "figuring this out…",
  "working on it…",
  "almost there…",
  "thinking…",
];

/** Compact label for the resolved widget answer shown as a user bubble. */
function summarizeAnswer(output: unknown): string {
  const r = output as UserInputResult;
  switch (r?.status) {
    case "event":
      return `${r.event.summary || "Event"}${r.event.start ? ` · ${formatWhen(r.event.start)}` : ""}`;
    case "email":
      return `Send: ${r.email.subject || "(no subject)"}`;
    case "revise":
      return `Improve: ${r.instruction}`;
    case "declined":
      return "Cancelled";
    case "selected":
      return r.value;
    case "multiselected":
      return r.values.join(", ");
    case "custom":
      return r.value;
    case "form":
      return Object.entries(r.data)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ");
    default:
      return "Submitted";
  }
}

function formatWhen(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ContextRing({ count, max }: { count: number; max: number }) {
  const r = 13;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(count / max, 1);
  const offset = circumference * (1 - progress);
  const stroke =
    count >= max ? "#ef4444" : count >= WARN_AT ? "#f59e0b" : "#9ca3af";

  return (
    <svg
      className="pointer-events-none absolute inset-0 -rotate-90"
      width="32"
      height="32"
    >
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke="#d1d5db"
        strokeWidth="1.5"
        className="dark:stroke-white/10"
      />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

function getGreeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function ThinkingIndicator() {
  const [{ index, charCount }, setState] = useState(() => ({
    index: Math.floor(Math.random() * THINKING_PHRASES.length),
    charCount: 0,
  }));

  const phrase = THINKING_PHRASES[index];
  const displayed = phrase.slice(0, charCount);
  const typing = charCount < phrase.length;

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.charCount >= THINKING_PHRASES[s.index].length) {
          clearInterval(id);
          return s;
        }
        return { ...s, charCount: s.charCount + 1 };
      });
    }, 35);
    return () => clearInterval(id);
  }, [index]);

  useEffect(() => {
    if (typing) return;
    const t = setTimeout(() => {
      setState((s) => ({
        index: (s.index + 1) % THINKING_PHRASES.length,
        charCount: 0,
      }));
    }, 1200);
    return () => clearTimeout(t);
  }, [typing, index]);

  return (
    <span className="font-mono text-[13px] text-zinc-400 dark:text-zinc-500">
      {displayed}
      {typing && (
        <span className="ml-px inline-block h-[13px] w-[2px] translate-y-px animate-pulse bg-zinc-400 dark:bg-zinc-500" />
      )}
    </span>
  );
}

type RenderItem =
  | { id: string; kind: "user-text"; text: string }
  | { id: string; kind: "assistant-text"; text: string }
  | { id: string; kind: "answer"; text: string };

function BotAvatar() {
  return <LogoMark size={24} className="h-6 w-6 shrink-0" />;
}

function UserAvatar({ image, name }: { image?: string | null; name?: string }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? "You"}
        referrerPolicy="no-referrer"
        className="h-6 w-6 shrink-0 rounded-md object-cover"
      />
    );
  }
  const initial = (name ?? "Y").trim().charAt(0).toUpperCase();
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-900 text-[11px] font-bold text-white">
      {initial}
    </div>
  );
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-1.5 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-1.5 ml-4 list-disc space-y-0.5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-black/10 px-1 py-px font-mono text-[12px] dark:bg-white/10">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-1.5 overflow-x-auto rounded bg-black/10 p-2 font-mono text-[12px] dark:bg-white/10">
      {children}
    </pre>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <p className="font-semibold">{children}</p>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <p className="font-semibold">{children}</p>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <p className="font-semibold">{children}</p>
  ),
};

export default function ChatPage() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const greeting = getGreeting(firstName);
  const userImage = session?.user?.image ?? null;
  const userName = session?.user?.name;

  const { messages, status, sendMessage, setMessages, addToolOutput } =
    useStreamingChat();
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStreaming = status === "submitted" || status === "streaming";
  const pending = useMemo(() => getPendingUserInput(messages), [messages]);

  const hasMessages = messages.length > 0;
  const atLimit = messages.length >= MAX_MESSAGES;
  const nearLimit = messages.length >= WARN_AT && !atLimit;

  const mentions = useContactMentions({
    value: query,
    setValue: setQuery,
    textareaRef,
  });

  // Flatten messages → render items (text bubbles + resolved-widget answer bubbles).
  const items = useMemo<RenderItem[]>(() => {
    const out: RenderItem[] = [];
    for (const m of messages) {
      if (m.role === "user") {
        const t = getMessageText(m);
        if (t) out.push({ id: m.id, kind: "user-text", text: t });
      } else if (m.role === "assistant") {
        m.parts.forEach((rawPart, i) => {
          const part = rawPart as {
            type: string;
            text?: string;
            state?: string;
            output?: unknown;
          };
          if (part.type === "text" && part.text) {
            out.push({
              id: `${m.id}-${i}`,
              kind: "assistant-text",
              text: part.text,
            });
          } else if (
            part.type === REQUEST_INPUT_PART_TYPE &&
            part.state === "output-available"
          ) {
            out.push({
              id: `${m.id}-${i}`,
              kind: "answer",
              text: summarizeAnswer(part.output),
            });
          }
        });
      }
    }
    return out;
  }, [messages]);

  const lastMsg = messages[messages.length - 1];
  const showThinking =
    isStreaming &&
    !pending &&
    (!lastMsg ||
      (lastMsg.role === "assistant" && getMessageText(lastMsg) === ""));

  useEffect(() => {
    if (!hasMessages) textareaRef.current?.focus();
  }, [hasMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key !== "/" || tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      textareaRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSend() {
    if (!query.trim() || isStreaming || atLimit || pending) return;
    sendMessage({ text: query.trim() });
    setQuery("");
    mentions.close();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  function clearChat() {
    setMessages([]);
  }

  const inputBar = (
    <div className="w-full max-w-4xl">
      {/* Limit banners */}
      {atLimit && !pending && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <span>Context limit reached — clear the chat to continue.</span>
          <button
            onClick={clearChat}
            className="ml-3 font-semibold underline underline-offset-2 hover:opacity-70"
          >
            Clear
          </button>
        </div>
      )}
      {nearLimit && !pending && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          <span>
            {MAX_MESSAGES - messages.length} messages left before context limit.
          </span>
          <button
            onClick={clearChat}
            className="ml-3 font-semibold underline underline-offset-2 hover:opacity-70"
          >
            Clear now
          </button>
        </div>
      )}

      {pending ? (
        // Input bar transforms into the requested widget.
        <InputWidget
          input={pending.input}
          onSubmit={handleWidgetSubmit}
          onCancel={handleWidgetCancel}
          disabled={isStreaming}
        />
      ) : (
        <Popover
          open={mentions.open}
          onOpenChange={(o) => {
            if (!o) mentions.close();
          }}
        >
          <PopoverAnchor asChild>
            <div className="flex items-end gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  mentions.sync(
                    e.target.value,
                    e.target.selectionStart ?? e.target.value.length,
                  );
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (mentions.handleKeyDown(e)) return;
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    query.trim() &&
                    !isStreaming &&
                    !atLimit
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  atLimit
                    ? "Clear the chat to continue…"
                    : isStreaming
                      ? "Calrix is thinking…"
                      : "Ask anything about your inbox or calendar…"
                }
                disabled={isStreaming || atLimit}
                rows={1}
                style={{ maxHeight: "160px" }}
                className="w-full resize-none overflow-y-auto bg-transparent py-0.5 text-sm leading-relaxed outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              {hasMessages && !isStreaming && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative shrink-0">
                        <ContextRing
                          count={messages.length}
                          max={MAX_MESSAGES}
                        />
                        <button
                          onClick={clearChat}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Clear chat · {messages.length}/{MAX_MESSAGES} messages
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <button
                onClick={handleSend}
                disabled={!query.trim() || isStreaming || atLimit}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                  query.trim() && !isStreaming && !atLimit
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </PopoverAnchor>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="max-h-64 w-(--radix-popover-trigger-width) min-w-72 overflow-y-auto p-1"
          >
            {mentions.results.map((c, i) => (
              <button
                key={c.email}
                type="button"
                onMouseEnter={() => mentions.setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  mentions.select(c);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                  i === mentions.activeIndex
                    ? "bg-orange-50 dark:bg-orange-950/30"
                    : "hover:bg-zinc-50 dark:hover:bg-white/5",
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  {c.name || c.email}
                </span>
                <span className="text-xs text-muted-foreground">{c.email}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {!hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <div className="text-center">
            <motion.h1
              className="text-2xl font-semibold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                backgroundImage:
                  "linear-gradient(120deg, var(--foreground) 0%, var(--foreground) 42%, #f97316 58%, #f97316 100%)",
                backgroundSize: "250% 250%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
              initial={{ backgroundPosition: "100% 100%" }}
              animate={{ backgroundPosition: "0% 0%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            >
              {greeting}
            </motion.h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              What can I help you with today?
            </p>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-2 gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  textareaRef.current?.focus();
                }}
                className="rounded-xl border border-zinc-200 px-4 py-3 text-left text-xs text-muted-foreground transition-colors hover:border-zinc-300 hover:text-foreground dark:border-white/10 dark:hover:border-white/20"
              >
                {ex}
              </button>
            ))}
          </div>

          {inputBar}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-4xl flex-col gap-5 px-6 py-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-end gap-3",
                    item.kind !== "assistant-text" && "flex-row-reverse",
                  )}
                >
                  {item.kind === "assistant-text" ? (
                    <BotAvatar />
                  ) : (
                    <UserAvatar image={userImage} name={userName} />
                  )}

                  {item.kind === "answer" ? (
                    <div className="flex max-w-[80%] items-center gap-1.5 rounded-2xl rounded-br-sm bg-blue-900 px-3 py-2 text-sm text-white">
                      <Check className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span>{item.text}</span>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        item.kind === "user-text"
                          ? "rounded-br-sm bg-blue-900 text-white whitespace-pre-wrap"
                          : "rounded-bl-sm bg-zinc-100 text-zinc-900 dark:bg-white/8 dark:text-zinc-100",
                      )}
                    >
                      {item.kind === "assistant-text" ? (
                        <ReactMarkdown components={markdownComponents}>
                          {item.text}
                        </ReactMarkdown>
                      ) : (
                        item.text
                      )}
                    </div>
                  )}
                </div>
              ))}

              {showThinking && (
                <div className="flex items-end gap-3">
                  <BotAvatar />
                  <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2.5 dark:bg-white/8">
                    <ThinkingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 px-6 py-4 flex justify-center">
            {inputBar}
          </div>
        </>
      )}
    </div>
  );
}
