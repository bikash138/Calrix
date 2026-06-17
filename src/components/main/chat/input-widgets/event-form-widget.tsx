"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import {
  eventDraftSchema,
  type EventDraftPartial,
  type UserInputResult,
} from "@/lib/request-input.schema";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "./date-time-picker";

type Props = {
  label: string;
  prefilled?: EventDraftPartial;
  /** Validated result handed back to the AI (resumes the run). */
  onSubmit: (result: UserInputResult) => void;
  /** Escape hatch — bail out of the form and keep talking. */
  onCancel: () => void;
  disabled?: boolean;
};

/** ISO string -> value accepted by <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"). */
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  // Trim seconds/offset if present; keep it lenient.
  const m = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return m ? m[1] : "";
}

export function EventFormWidget({
  label,
  prefilled,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [summary, setSummary] = useState(prefilled?.summary ?? "");
  const [start, setStart] = useState(toLocalInput(prefilled?.start));
  const [end, setEnd] = useState(toLocalInput(prefilled?.end));
  const [location, setLocation] = useState(prefilled?.location ?? "");
  const [description, setDescription] = useState(prefilled?.description ?? "");
  const [attendeesRaw, setAttendeesRaw] = useState(
    (prefilled?.attendeeEmails ?? []).join(", "),
  );
  const [error, setError] = useState<string | null>(null);

  const attendeeEmails = useMemo(
    () =>
      attendeesRaw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [attendeesRaw],
  );

  function handleSubmit() {
    setError(null);

    if (start && end && end < start) {
      setError("End time must be after the start time.");
      return;
    }

    const parsed = eventDraftSchema.safeParse({
      summary,
      start,
      end,
      location,
      description,
      attendeeEmails,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const field = first?.path.join(".") || "form";
      setError(
        field.startsWith("attendee")
          ? "One or more attendee emails are invalid."
          : `Please fill in the ${field || "required fields"}.`,
      );
      return;
    }

    onSubmit({ status: "event", event: parsed.data });
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-orange-400 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100";
  const labelCls = "text-[11px] font-medium text-zinc-500 dark:text-zinc-400";

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
      {/* Header / question */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <button
          onClick={onCancel}
          disabled={disabled}
          title="Cancel — type instead"
          className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className="grid grid-cols-2 gap-3"
        onKeyDown={(e) => {
          const tag = (e.target as HTMLElement).tagName;
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            (tag === "INPUT" || tag === "TEXTAREA")
          ) {
            e.preventDefault();
            if (summary.trim() && start && end) handleSubmit();
          }
        }}
      >
        <div className="col-span-2">
          <label className={labelCls}>Title</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={disabled}
            placeholder="Lunch with Sarah"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Start</label>
          <DateTimePicker
            value={start}
            onChange={setStart}
            disabled={disabled}
            placeholder="Pick start"
          />
        </div>

        <div>
          <label className={labelCls}>End</label>
          <DateTimePicker
            value={end}
            onChange={setEnd}
            disabled={disabled}
            placeholder="Pick end"
          />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={disabled}
            placeholder="Optional"
            className={inputCls}
          />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Attendees</label>
          <input
            value={attendeesRaw}
            onChange={(e) => setAttendeesRaw(e.target.value)}
            disabled={disabled}
            placeholder="comma-separated emails"
            className={inputCls}
          />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={disabled}
            rows={2}
            placeholder="Optional"
            className={cn(inputCls, "resize-none")}
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={disabled}
          className="rounded-full px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || !summary.trim() || !start || !end}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            !disabled && summary.trim() && start && end
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-600",
          )}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
