import type {
  InboxView,
  SummaryStyle,
  FollowUpSensitivity,
  CalendarView,
  WeekStart,
  WorkdayStart,
  WorkdayEnd,
  MeetingBuffer,
  UserRole,
  EmailVolume,
  UrgencySignal,
} from "@/server/db/schema/settings";

export const INBOX_VIEW_LABEL: Record<InboxView, string> = {
  all:    "All",
  unread: "Unread",
  sent:   "Sent",
};

export const SUMMARY_LABEL: Record<SummaryStyle, string> = {
  brief:    "Brief",
  detailed: "Detailed",
};

export const FOLLOWUP_LABEL: Record<FollowUpSensitivity, string> = {
  minimal:    "Minimal",
  balanced:   "Balanced",
  aggressive: "Aggressive",
};

export const CAL_VIEW_LABEL: Record<CalendarView, string> = {
  month: "Month",
  week:  "Week",
  day:   "Day",
};

export const WEEK_START_LABEL: Record<WeekStart, string> = {
  sunday: "Sunday",
  monday: "Monday",
};

export const WORKDAY_START_LABEL: Record<WorkdayStart, string> = {
  "05:00": "5:00 AM",
  "06:00": "6:00 AM",
  "07:00": "7:00 AM",
  "08:00": "8:00 AM",
  "09:00": "9:00 AM",
  "10:00": "10:00 AM",
  "11:00": "11:00 AM",
  "12:00": "12:00 PM",
  "13:00": "1:00 PM",
  "14:00": "2:00 PM",
  "15:00": "3:00 PM",
  "16:00": "4:00 PM",
  "17:00": "5:00 PM",
  "18:00": "6:00 PM",
  "19:00": "7:00 PM",
  "20:00": "8:00 PM",
  "21:00": "9:00 PM",
  "22:00": "10:00 PM",
  "23:00": "11:00 PM",
};

export const WORKDAY_END_LABEL: Record<WorkdayEnd, string> = {
  "17:00": "5:00 PM",
  "18:00": "6:00 PM",
  "19:00": "7:00 PM",
  "20:00": "8:00 PM",
  "21:00": "9:00 PM",
  "22:00": "10:00 PM",
  "23:00": "11:00 PM",
  "00:00": "Midnight",
  "01:00": "1:00 AM",
  "02:00": "2:00 AM",
  "03:00": "3:00 AM",
  "04:00": "4:00 AM",
  "05:00": "5:00 AM",
  "06:00": "6:00 AM",
};

export const BUFFER_LABEL: Record<MeetingBuffer, string> = {
  none:    "None",
  "15min": "15 min",
  "30min": "30 min",
  "45min": "45 min",
  "1hr":   "1 hour",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  casual:      "Just browsing / Casual",
  founder:     "Founder / Executive",
  sales:       "Sales / Business Dev",
  engineering: "Engineering / Technical",
  operations:  "Operations / Admin",
  other:       "Something else",
};

export const VOLUME_LABEL: Record<EmailVolume, string> = {
  under20:  "Under 20",
  "20-50":  "20 – 50",
  "50-100": "50 – 100",
  "100+":   "100+",
};

export const URGENCY_LABEL: Record<UrgencySignal, string> = {
  vip_sender:  "Direct asks from key people",
  deadlines:   "Deadlines mentioned",
  replies:     "Replies to emails I sent",
  money:       "Money / contracts / legal",
  scheduling:  "Calendar invites / scheduling",
  tasks:       "Tasks or deliverables assigned to me",
};
