import { Flame, Sparkles, Send } from "lucide-react";
import { LogoMark } from "@/assets/logo";

const STEPS = ["Summarized", "Prioritized", "Drafted reply"];

/**
 * Decorative, non-interactive mock of the Calrix Agent output.
 * Shows the agent reading an urgent email, prioritizing it and drafting
 * a reply. Used in the third step card of the diagram section.
 */
export default function AgentMock() {
  return (
    <div className="pointer-events-none flex h-full w-full select-none items-center justify-center">
      <div className="flex h-full w-full flex-col justify-center gap-2.5 overflow-hidden rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-xl shadow-black/5">
        {/* Incoming email */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[0.6rem] font-bold text-white">
            NS
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.72rem] font-semibold text-zinc-800">
              Jane Doe
            </p>
            <p className="truncate text-[0.62rem] text-zinc-400">
              Urgent: backend pipeline down
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[0.56rem] font-semibold uppercase tracking-wide text-rose-700">
            Critical
          </span>
        </div>

        {/* Agent processing pills */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[0.58rem] font-semibold text-orange-600">
            <LogoMark size={11} className="h-2.5 w-2.5 rounded-sm" />
            Calrix Agent
          </span>
          {STEPS.map((s) => (
            <span
              key={s}
              className="truncate rounded-full bg-zinc-100 px-2 py-0.5 text-[0.56rem] font-medium text-zinc-500"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Suggested action */}
        <p className="flex items-start gap-1.5 rounded-lg bg-zinc-900/[0.03] px-2.5 py-1.5 text-[0.66rem] leading-snug text-zinc-600">
          <Flame className="mt-px h-3 w-3 shrink-0 text-rose-500" />
          <span>Take urgent action to fix the data pipeline.</span>
        </p>

        {/* Drafted reply */}
        <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
          <p className="mb-1 flex items-center gap-1.5 text-[0.54rem] font-semibold uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-2.5 w-2.5" />
            Drafted reply
          </p>
          <p className="line-clamp-2 text-[0.68rem] leading-relaxed text-zinc-700">
            Nikita, the pipeline is down and we need to fix this urgently to
            prevent data loss. I&apos;m prioritizing it now.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <span className="rounded-lg px-3 py-1 text-[0.64rem] font-medium text-zinc-400">
            Improve
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-1 text-[0.64rem] font-semibold text-white shadow-sm shadow-orange-500/25">
            <Send className="h-3 w-3" />
            Send
          </span>
        </div>
      </div>
    </div>
  );
}
