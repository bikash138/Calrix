"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  CAL_VIEW_LABEL,
  WEEK_START_LABEL,
  WORKDAY_START_LABEL,
  WORKDAY_END_LABEL,
  BUFFER_LABEL,
} from "@/data/settings-labels";
import type {
  CalendarView,
  WeekStart,
  WorkdayStart,
  WorkdayEnd,
  MeetingBuffer,
  CalendarSettings,
} from "@/server/db/schema/settings";
import { SegmentedControl, Row, Group } from "./settings-primitives";

const TIMEZONES: string[] =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [];

function timezoneLabel(tz: string): string {
  try {
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    return offset ? `${tz.replace(/_/g, " ")} (${offset})` : tz.replace(/_/g, " ");
  } catch {
    return tz.replace(/_/g, " ");
  }
}

function TimezoneCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = TIMEZONES.includes(value)
    ? TIMEZONES
    : [value, ...TIMEZONES];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          className="flex h-7 w-[220px] items-center justify-between gap-2 rounded-md border border-border bg-transparent px-3 text-[0.72rem] text-foreground transition-colors hover:bg-muted/40 cursor-pointer"
        >
          <span className="truncate">{timezoneLabel(value)}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px]" align="end">
        <Command>
          <CommandInput
            placeholder="Search timezone…"
            className="h-10 text-[0.8rem]"
            wrapperClassName="border-t-0 px-3"
          />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            {options.map((tz) => (
              <CommandItem
                key={tz}
                value={`${tz} ${timezoneLabel(tz)}`}
                onSelect={() => {
                  onChange(tz);
                  setOpen(false);
                }}
                className="text-[0.78rem]"
              >
                <span className="truncate">{timezoneLabel(tz)}</span>
                <Check
                  className={cn(
                    "ml-auto size-3.5",
                    tz === value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CalendarSection({
  form,
  onChange,
}: {
  form: CalendarSettings;
  onChange: (patch: Partial<CalendarSettings>) => void;
}) {
  return (
    <div>
      <Group title="View">
        <Row
          label="Default view"
          description="Which view opens when you visit Calendar"
        >
          <SegmentedControl
            options={["Month", "Week", "Day"]}
            value={CAL_VIEW_LABEL[form.defaultView]}
            onChange={(label) => {
              const raw = (Object.entries(CAL_VIEW_LABEL) as [CalendarView, string][])
                .find(([, v]) => v === label)?.[0];
              if (raw) onChange({ defaultView: raw });
            }}
          />
        </Row>
        <Row label="Week starts on">
          <SegmentedControl
            options={["Sunday", "Monday"]}
            value={WEEK_START_LABEL[form.weekStartsOn]}
            onChange={(label) => {
              const raw = (Object.entries(WEEK_START_LABEL) as [WeekStart, string][])
                .find(([, v]) => v === label)?.[0];
              if (raw) onChange({ weekStartsOn: raw });
            }}
          />
        </Row>
      </Group>

      <Group title="Timezone">
        <Row
          label="Timezone"
          description="Used when scheduling events"
          last
        >
          <TimezoneCombobox
            value={form.timezone}
            onChange={(tz) => onChange({ timezone: tz })}
          />
        </Row>
      </Group>

      <Group title="Working Hours">
        <Row label="Day starts at">
          <Select
            value={form.workdayStart}
            onValueChange={(raw) => onChange({ workdayStart: raw as WorkdayStart })}
          >
            <SelectTrigger className="h-7 w-[120px] cursor-pointer text-[0.72rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(WORKDAY_START_LABEL) as [WorkdayStart, string][]).map(([raw, label]) => (
                <SelectItem key={raw} value={raw} className="cursor-pointer text-[0.72rem]">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Day ends at" last>
          <Select
            value={form.workdayEnd}
            onValueChange={(raw) => onChange({ workdayEnd: raw as WorkdayEnd })}
          >
            <SelectTrigger className="h-7 w-[120px] cursor-pointer text-[0.72rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(WORKDAY_END_LABEL) as [WorkdayEnd, string][]).map(([raw, label]) => (
                <SelectItem key={raw} value={raw} className="cursor-pointer text-[0.72rem]">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Meetings">
        <Row
          label="Meeting buffer"
          description="Automatic gap added between back-to-back meetings"
          last
        >
          <Select
            value={form.meetingBuffer}
            onValueChange={(raw) => onChange({ meetingBuffer: raw as MeetingBuffer })}
          >
            <SelectTrigger className="h-7 w-[120px] cursor-pointer text-[0.72rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(BUFFER_LABEL) as [MeetingBuffer, string][]).map(([raw, label]) => (
                <SelectItem key={raw} value={raw} className="cursor-pointer text-[0.72rem]">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </Group>
    </div>
  );
}
