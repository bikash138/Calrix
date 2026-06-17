"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  /** "YYYY-MM-DDTHH:mm" when withTime, else "YYYY-MM-DD". */
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtDatePart(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parse(value: string): { date?: Date; time: string } {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return { time: "" };
  const [, y, mo, d, h, mi] = m;
  return {
    date: new Date(Number(y), Number(mo) - 1, Number(d)),
    time: h && mi ? `${h}:${mi}` : "",
  };
}

function label(value: string, withTime: boolean): string | null {
  const { date, time } = parse(value);
  if (!date) return null;
  const datePart = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!withTime) return datePart;
  if (!time) return datePart;
  const [h, mi] = time.split(":").map(Number);
  const t = new Date(date);
  t.setHours(h, mi);
  return `${datePart} · ${t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function DateTimePicker({
  value,
  onChange,
  withTime = true,
  disabled,
  placeholder = "Pick a date",
}: Props) {
  const [open, setOpen] = useState(false);
  const { date, time } = parse(value);
  const display = label(value, withTime);

  function handleSelectDate(next?: Date) {
    if (!next) return;
    if (withTime) {
      onChange(`${fmtDatePart(next)}T${time || "09:00"}`);
    } else {
      onChange(fmtDatePart(next));
      setOpen(false);
    }
  }

  function handleTime(t: string) {
    const base = date ?? new Date();
    onChange(`${fmtDatePart(base)}T${t || "09:00"}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-left text-sm outline-none transition-colors hover:border-zinc-300 focus-visible:border-orange-400 disabled:opacity-50 aria-expanded:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20",
            display ? "text-foreground" : "text-zinc-400",
          )}
        >
          <span className="truncate">{display ?? placeholder}</span>
          <CalendarIcon className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          autoFocus
        />
        {withTime && (
          <div className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-white/10">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Time
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTime(e.target.value)}
              disabled={disabled}
              className="ml-auto rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
