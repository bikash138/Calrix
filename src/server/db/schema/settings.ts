// Enums
export const InboxView = {
  ALL: "all",
  UNREAD: "unread",
  SENT: "sent",
} as const;
export type InboxView = (typeof InboxView)[keyof typeof InboxView];

export const SummaryStyle = {
  BRIEF: "brief",
  DETAILED: "detailed",
} as const;
export type SummaryStyle = (typeof SummaryStyle)[keyof typeof SummaryStyle];

export const FollowUpSensitivity = {
  MINIMAL: "minimal",
  BALANCED: "balanced",
  AGGRESSIVE: "aggressive",
} as const;
export type FollowUpSensitivity =
  (typeof FollowUpSensitivity)[keyof typeof FollowUpSensitivity];

export const CalendarView = {
  MONTH: "month",
  WEEK: "week",
  DAY: "day",
} as const;
export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView];

export const WeekStart = {
  SUNDAY: "sunday",
  MONDAY: "monday",
} as const;
export type WeekStart = (typeof WeekStart)[keyof typeof WeekStart];

export const WorkdayStart = {
  AM_5: "05:00",
  AM_6: "06:00",
  AM_7: "07:00",
  AM_8: "08:00",
  AM_9: "09:00",
  AM_10: "10:00",
  AM_11: "11:00",
  PM_12: "12:00",
  PM_1: "13:00",
  PM_2: "14:00",
  PM_3: "15:00",
  PM_4: "16:00",
  PM_5: "17:00",
  PM_6: "18:00",
  PM_7: "19:00",
  PM_8: "20:00",
  PM_9: "21:00",
  PM_10: "22:00",
  PM_11: "23:00",
} as const;
export type WorkdayStart = (typeof WorkdayStart)[keyof typeof WorkdayStart];

export const WorkdayEnd = {
  PM_5: "17:00",
  PM_6: "18:00",
  PM_7: "19:00",
  PM_8: "20:00",
  PM_9: "21:00",
  PM_10: "22:00",
  PM_11: "23:00",
  MIDNIGHT: "00:00",
  AM_1: "01:00",
  AM_2: "02:00",
  AM_3: "03:00",
  AM_4: "04:00",
  AM_5: "05:00",
  AM_6: "06:00",
} as const;
export type WorkdayEnd = (typeof WorkdayEnd)[keyof typeof WorkdayEnd];

export const MeetingBuffer = {
  NONE: "none",
  MIN_15: "15min",
  MIN_30: "30min",
  MIN_45: "45min",
  HR_1: "1hr",
} as const;
export type MeetingBuffer = (typeof MeetingBuffer)[keyof typeof MeetingBuffer];

export const UserRole = {
  CASUAL: "casual",
  FOUNDER: "founder",
  SALES: "sales",
  ENGINEERING: "engineering",
  OPERATIONS: "operations",
  OTHER: "other",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const EmailVolume = {
  UNDER_20: "under20",
  RANGE_20_50: "20-50",
  RANGE_50_100: "50-100",
  OVER_100: "100+",
} as const;
export type EmailVolume = (typeof EmailVolume)[keyof typeof EmailVolume];

export const UrgencySignal = {
  VIP_SENDER: "vip_sender",
  DEADLINES: "deadlines",
  REPLIES: "replies",
  MONEY: "money",
  SCHEDULING: "scheduling",
  TASKS: "tasks",
} as const;
export type UrgencySignal = (typeof UrgencySignal)[keyof typeof UrgencySignal];

// Section types
export type InboxSettings = {
  defaultView: InboxView;
  signature: string;
  urgencySignals: UrgencySignal[];
  vipSenders: string[];
};

export type CalendarSettings = {
  defaultView: CalendarView;
  weekStartsOn: WeekStart;
  workdayStart: WorkdayStart;
  workdayEnd: WorkdayEnd;
  meetingBuffer: MeetingBuffer;
};

export type AISettings = {
  summaryStyle: SummaryStyle;
  followUpSensitivity: FollowUpSensitivity;
  trainingOptOut: boolean;
  role: UserRole | null;
  roleOther: string;
  volume: EmailVolume | null;
};

export type UserPreferences = {
  inbox: InboxSettings;
  calendar: CalendarSettings;
  ai: AISettings;
};

// Defaults
export const DEFAULT_INBOX: InboxSettings = {
  defaultView: InboxView.ALL,
  signature: "",
  urgencySignals: [UrgencySignal.MONEY, UrgencySignal.DEADLINES],
  vipSenders: [],
};

export const DEFAULT_CALENDAR: CalendarSettings = {
  defaultView: CalendarView.WEEK,
  weekStartsOn: WeekStart.SUNDAY,
  workdayStart: WorkdayStart.AM_9,
  workdayEnd: WorkdayEnd.PM_6,
  meetingBuffer: MeetingBuffer.MIN_30,
};

export const DEFAULT_AI: AISettings = {
  summaryStyle: SummaryStyle.BRIEF,
  followUpSensitivity: FollowUpSensitivity.BALANCED,
  trainingOptOut: false,
  role: UserRole.CASUAL,
  roleOther: "",
  volume: null,
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  inbox: DEFAULT_INBOX,
  calendar: DEFAULT_CALENDAR,
  ai: DEFAULT_AI,
};
