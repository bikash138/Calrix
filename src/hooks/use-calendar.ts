"use client";

import { useQuery } from "@tanstack/react-query";
import { calendarApi } from "@/lib/api-client/calendar.api";

export function useCalendarEvents(timeMin: string, timeMax: string) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["calendar-events", timeMin, timeMax],
    queryFn: () => calendarApi.listEvents(timeMin, timeMax),
    staleTime: 60_000,
  });

  return {
    events: data?.events ?? [],
    isPending,
    isError,
  };
}
