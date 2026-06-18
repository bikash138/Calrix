"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { LogoMark } from "@/assets/logo";

const STEPS = [
  { prompt: "Get me today's emails", status: "Fetching Gmail" },
  { prompt: "What's on my calendar?", status: "Fetching Calendar" },
  { prompt: "Draft replies to the urgent ones", status: "Calling MCP tools" },
  { prompt: "Save it all for later", status: "Caching to database" },
];

/**
 * Decorative, non-interactive mock of Corsair working through its steps.
 * A status card cycles through the steps while a dark input box types the
 * current step with a typewriter effect. Used in the second step card of
 * the diagram section.
 */
export default function CorsairMock() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const full = STEPS[index].prompt;
    if (text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 55);
      return () => clearTimeout(t);
    }
    // Fully typed — pause, then advance to the next step.
    const t = setTimeout(() => {
      setText("");
      setIndex((i) => (i + 1) % STEPS.length);
    }, 1500);
    return () => clearTimeout(t);
  }, [text, index]);

  return (
    <div className="pointer-events-none flex h-full w-full select-none items-center justify-center">
      <div className="flex h-full w-full flex-col justify-center gap-3 overflow-hidden rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-xl shadow-black/5">
        {/* Status card */}
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-orange-500" />
              <p className="text-[0.85rem] font-semibold leading-tight text-zinc-800">
                {STEPS[index].status}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-orange-100 px-2 py-0.5 text-[0.6rem] font-semibold text-orange-600">
              In Progress
            </span>
          </div>
        </div>

        {/* Typewriter input box */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-zinc-900 px-3.5 py-3 shadow-md">
          <LogoMark size={18} className="h-4 w-4 shrink-0 rounded-sm" />
          <span className="flex-1 truncate font-mono text-[0.8rem] text-zinc-100">
            {text}
            <span className="ml-px inline-block w-px animate-pulse text-zinc-300">
              ▋
            </span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
