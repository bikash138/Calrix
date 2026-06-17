"use client";

import { useMemo } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function SidebarMiniCalendar() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekStart = useMemo(
    () => startOfWeek(today, { weekStartsOn: 0 }),
    [today],
  );
  const weekEnd = useMemo(() => endOfWeek(today, { weekStartsOn: 0 }), [today]);

  return (
    <Calendar
      mode="range"
      selected={{ from: weekStart, to: weekEnd }}
      onSelect={() => {}}
      className="w-full [--cell-size:1.375rem]"
      showOutsideDays
      classNames={{
        months: "relative flex w-full flex-col",
        month: "flex w-full flex-col gap-1.5",
        month_caption: "flex h-5 items-center justify-center px-5",
        caption_label: "text-[0.72rem] font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "size-5 p-0 text-muted-foreground/60 hover:text-foreground",
        button_next:
          "size-5 p-0 text-muted-foreground/60 hover:text-foreground",
        weekdays: "flex",
        weekday:
          "flex-1 text-center text-[0.6rem] font-normal text-muted-foreground select-none",
        week: "flex w-full",
        day: "relative flex-1 p-0 text-center",
        range_start: "rounded-l-md bg-muted/50",
        range_middle: "rounded-none bg-muted/50",
        range_end: "rounded-r-md bg-muted/50",
        today: "bg-muted/50",
        outside: "opacity-35",
        disabled: "opacity-25",
      }}
      components={{
        DayButton: ({ day, modifiers, ...props }) => {
          const isToday = modifiers.today;
          const inRange =
            modifiers.range_start ||
            modifiers.range_middle ||
            modifiers.range_end;
          return (
            <button
              {...props}
              className={cn(
                "flex aspect-square w-full cursor-default items-center justify-center rounded-[5px] text-[0.67rem]",
                isToday
                  ? "bg-primary font-semibold text-primary-foreground"
                  : inRange
                    ? "text-foreground/80"
                    : modifiers.outside
                      ? "text-muted-foreground"
                      : "text-foreground/75",
              )}
            />
          );
        },
      }}
    />
  );
}
