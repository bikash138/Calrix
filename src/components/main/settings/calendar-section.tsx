"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
