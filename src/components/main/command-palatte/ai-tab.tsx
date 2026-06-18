"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { LogoMark } from "@/assets/logo";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { getMessageText } from "@/hooks/use-streaming-chat";

const THINKING_PHRASES = [
  "hmm…",
  "let me think…",
  "on it…",
  "give me a sec…",
  "figuring this out…",
  "working on it…",
  "almost there…",
  "hold on…",
  "thinking…",
  "one moment…",
];

function ThinkingIndicator() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * THINKING_PHRASES.length),
  );
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = THINKING_PHRASES[index];
    let i = 0;

    const typeInterval = setInterval(() => {
      i++;
      setDisplayed(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(typeInterval);
        setTyping(false);
        setTimeout(() => {
          setDisplayed("");
          setTyping(true);
          setIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
        }, 1200);
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [index]);

  return (
    <span className="font-mono text-[13px] text-zinc-400 dark:text-zinc-500">
      {displayed}
      {typing && (
        <span className="ml-px inline-block h-[13px] w-[2px] translate-y-[1px] animate-pulse bg-zinc-400 dark:bg-zinc-500" />
      )}
    </span>
  );
}

type Props = {
  messages: UIMessage[];
  isStreaming: boolean;
  maximized?: boolean;
};

export function AiTab({ messages, maximized }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          maximized ? "h-full" : "h-[325px]",
          "flex flex-col items-center justify-center gap-4 px-6",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
          <LogoMark size={20} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Ask anything</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Say it. Calrix handles it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "no-scrollbar flex flex-col gap-3 overflow-y-auto p-4",
        maximized ? "h-full" : "h-[325px]",
      )}
    >
      {messages.map((msg) => {
        const text = getMessageText(msg);
        return (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              msg.role === "user" && "flex-row-reverse",
            )}
          >
            {msg.role === "assistant" && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60">
                <LogoMark size={14} />
              </div>
            )}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-br-sm bg-blue-900 text-white whitespace-pre-wrap"
                  : "rounded-bl-sm bg-zinc-100 text-zinc-900 dark:bg-white/8 dark:text-zinc-100",
              )}
            >
              {msg.role === "assistant" && text === "" ? (
                <ThinkingIndicator />
              ) : msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-1 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-1 ml-3 list-disc space-y-0.5">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-1 ml-3 list-decimal space-y-0.5">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li>{children}</li>,
                    code: ({ children }) => (
                      <code className="rounded bg-black/10 px-1 py-px font-mono text-[12px] dark:bg-white/10">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="mb-1 overflow-x-auto rounded bg-black/10 p-2 font-mono text-[12px] dark:bg-white/10">
                        {children}
                      </pre>
                    ),
                    h1: ({ children }) => (
                      <p className="font-semibold">{children}</p>
                    ),
                    h2: ({ children }) => (
                      <p className="font-semibold">{children}</p>
                    ),
                    h3: ({ children }) => (
                      <p className="font-semibold">{children}</p>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              ) : (
                text
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
