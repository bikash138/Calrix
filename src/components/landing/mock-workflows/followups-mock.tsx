import { X, Flame, Send } from "lucide-react";
import { LogoMark } from "@/assets/logo";

const REPLY =
  "Nikita,\n\nThe pipeline is down and we need to fix this urgently to prevent data loss. Please prioritize it and keep me posted.\n\nBest,\nBikash";

/**
 * Decorative, non-interactive mock of the Actions reply modal.
 * Shown for the Follow-ups tab in a glassy card over the background.
 */
export default function FollowupsMock() {
  return (
    <div className="pointer-events-none relative z-10 w-[97%] max-w-md origin-center scale-[0.92] select-none">
      <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/70 shadow-2xl shadow-black/10 ring-1 ring-white/40 backdrop-blur-xl">
        {/* Decorative top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-orange-500/10 via-orange-500/[0.03] to-transparent"
        />

        {/* Header */}
        <div className="relative flex shrink-0 items-center gap-3 border-b border-zinc-200/70 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[0.7rem] font-bold text-white shadow-sm ring-2 ring-white">
            NS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9rem] font-semibold leading-tight text-zinc-900">
              Follow up
              <span className="font-normal text-zinc-400"> · Nikita Shaw</span>
            </p>
            <p className="mt-0.5 truncate text-[0.66rem] text-zinc-400">
              Urgent: backend pipeline down
            </p>
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400">
            <X className="h-4 w-4" />
          </span>
        </div>

        <div className="relative px-4 py-3">
          {/* Calrix Read panel */}
          <div className="mb-3 rounded-2xl border border-orange-500/20 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-orange-600">
                <LogoMark size={12} className="h-3 w-3 rounded-sm" />
                Calrix Read
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.58rem] font-semibold capitalize text-rose-700">
                Critical
              </span>
            </div>
            <p className="text-[0.72rem] leading-relaxed text-zinc-700">
              The backend data pipeline is down, risking user data loss — needs
              immediate attention.
            </p>
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-zinc-900/[0.03] px-2.5 py-1.5 text-[0.7rem] text-zinc-600">
              <Flame className="mt-px h-3 w-3 shrink-0 text-rose-500" />
              <span>Take urgent action to fix the data pipeline.</span>
            </p>
          </div>

          {/* Your reply */}
          <p className="mb-1.5 flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-widest text-zinc-400">
            <Send className="h-3 w-3" />
            Your reply
          </p>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
            <p className="line-clamp-2 whitespace-pre-wrap text-[0.72rem] leading-relaxed text-zinc-700">
              {REPLY}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex shrink-0 items-center justify-between gap-2 border-t border-zinc-200/70 bg-zinc-50/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[0.68rem] font-medium text-zinc-700 shadow-sm">
              <LogoMark size={14} className="h-3.5 w-3.5 rounded-sm" />
              Draft reply
            </span>
            <span className="rounded-lg px-3 py-1.5 text-[0.68rem] font-medium text-zinc-400">
              Improve
            </span>
          </div>

          <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-1.5 text-[0.7rem] font-semibold text-white shadow-md shadow-orange-500/25">
            <Send className="h-3.5 w-3.5" />
            Send
          </span>
        </div>
      </div>
    </div>
  );
}
