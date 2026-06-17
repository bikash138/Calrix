import { apiClient } from "./axios";
import type {
  CalendarEvent,
  CalendarEventList,
  CreateEventInput,
  UpdateEventInput,
} from "@/server/module/calendar/calendar-events.schema";

export type { CalendarEvent, CalendarEventList, Attendee } from "@/server/module/calendar/calendar-events.schema";

type ApiResponse<T> = { success: true; message: string; data: T };

export const calendarApi = {
  listEvents: async (timeMin: string, timeMax: string, calendarId = "primary"): Promise<CalendarEventList> => {
    const { data } = await apiClient.get<ApiResponse<CalendarEventList>>(
      "/api/calendar/events",
      { params: { timeMin, timeMax, calendarId } },
    );
    return data.data;
  },

  getEvent: async (eventId: string): Promise<CalendarEvent> => {
    const { data } = await apiClient.get<ApiResponse<{ event: CalendarEvent }>>(
      `/api/calendar/events/${eventId}`,
    );
    return data.data.event;
  },

  createEvent: async (input: Omit<CreateEventInput, "calendarId">): Promise<CalendarEvent> => {
    const { data } = await apiClient.post<ApiResponse<{ event: CalendarEvent }>>(
      "/api/calendar/events",
      input,
    );
    return data.data.event;
  },

  updateEvent: async (eventId: string, input: Omit<UpdateEventInput, "calendarId">): Promise<CalendarEvent> => {
    const { data } = await apiClient.patch<ApiResponse<{ event: CalendarEvent }>>(
      `/api/calendar/events/${eventId}`,
      input,
    );
    return data.data.event;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/api/calendar/events/${eventId}`);
  },
};
