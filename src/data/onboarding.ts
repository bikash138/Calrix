//Types

export type Role = "founder" | "sales" | "engineering" | "operations" | "other";
export type Volume = "under20" | "20-50" | "50-100" | "100+";
export type UrgencySignal =
  | "vip_sender"
  | "deadlines"
  | "replies"
  | "money"
  | "scheduling"
  | "tasks";
export type SummaryStyle = "brief" | "detailed";
export type FollowUp = "minimal" | "balanced" | "aggressive";

export interface FormState {
  role: Role | null;
  roleOther: string;
  volume: Volume | null;
  urgencySignals: UrgencySignal[];
  summaryStyle: SummaryStyle | null;
  followUp: FollowUp | null;
  vipSenders: string[];
  trainingOptOut: boolean;
}

export const INITIAL_FORM: FormState = {
  role: null,
  roleOther: "",
  volume: null,
  urgencySignals: [],
  summaryStyle: null,
  followUp: null,
  vipSenders: [],
  trainingOptOut: false,
};

//Step metadata

export const STEPS = [
  {
    label: "01 / Role",
    heading: "What best describes your work?",
    sub: "This helps Calrix to know who you are.",
  },
  {
    label: "02 / Volume",
    heading:
      "How many primary emails do you get per day (except promotions, socials, etc.)?",
    sub: "Helps Calrix cut through the noise and surface only what actually matters.",
  },
  {
    label: "03 / Urgency",
    heading: "What makes an email urgent to you?",
    sub: "Pick at most two signals that actually matter.",
  },
  {
    label: "04 / Summaries",
    heading: "How should Calrix summarise emails?",
    sub: "Choose the style that fits how you think.",
  },
  {
    label: "05 / Follow-ups",
    heading: "How proactive should Calrix be about follow-ups?",
    sub: "We will surface unanswered threads based on this.",
  },
  {
    label: "06 / VIPs",
    heading: "Who should always land at the top?",
    sub: "Optional — skip if you'd rather set this later.",
  },
  {
    label: "07 / Privacy",
    heading: "Help us improve Calrix AI?",
    sub: "Your choice, always changeable in settings.",
  },
] as const;

export const TOTAL_STEPS = STEPS.length;

//Question options

export const ROLE_OPTIONS: { id: Role; label: string; sub: string }[] = [
  {
    id: "founder",
    label: "Founder / Executive",
    sub: "Leading teams, high-stakes decisions",
  },
  {
    id: "sales",
    label: "Sales / Business Dev",
    sub: "Deals, prospects, follow-ups",
  },
  {
    id: "engineering",
    label: "Engineering / Technical",
    sub: "Code reviews, async coordination",
  },
  {
    id: "operations",
    label: "Operations / Admin",
    sub: "Scheduling, logistics, coordination",
  },
  { id: "other", label: "Something else", sub: "Tell us what you do" },
];

export const VOLUME_OPTIONS: { id: Volume; label: string; sub: string }[] = [
  { id: "under20", label: "Under 20", sub: "A quiet, manageable inbox" },
  { id: "20-50", label: "20 – 50", sub: "Moderate flow, some noise" },
  { id: "50-100", label: "50 – 100", sub: "Busy — needs prioritisation" },
  { id: "100+", label: "100+", sub: "High volume, must triage hard" },
];

export const URGENCY_OPTIONS: { id: UrgencySignal; label: string }[] = [
  { id: "vip_sender", label: "Direct asks from key people" },
  { id: "deadlines", label: "Deadlines mentioned" },
  { id: "replies", label: "Replies to emails I sent" },
  { id: "money", label: "Money / contracts / legal" },
  { id: "scheduling", label: "Calendar invites / scheduling" },
  { id: "tasks", label: "Tasks or deliverables assigned to me" },
];

export const SUMMARY_OPTIONS: {
  id: SummaryStyle;
  label: string;
  sub: string;
  example: string;
}[] = [
  {
    id: "brief",
    label: "Give me the gist",
    sub: "One-line summary. Fast, no fluff.",
    example: '"David needs the contract by Friday."',
  },
  {
    id: "detailed",
    label: "Full picture",
    sub: "Key points, context, what to do.",
    example:
      '"David from Acme replied about the contract. He needs the signed copy by Friday EOD. He also raised a question about clause 4.2."',
  },
];

export const FOLLOWUP_OPTIONS: { id: FollowUp; label: string; sub: string }[] =
  [
    {
      id: "minimal",
      label: "Only if it's been days",
      sub: "I'll remember on my own. Remind me only when something's really overdue.",
    },
    {
      id: "balanced",
      label: "Nudge after a day or two",
      sub: "Surface threads I haven't replied to after a reasonable gap.",
    },
    {
      id: "aggressive",
      label: "Stay on top of everything",
      sub: "Actively flag anything unanswered. I don't want to drop the ball.",
    },
  ];

export const VIPS_PLACEHOLDER = "david@acme.com\njane@company.com\nSarah";

export const PRIVACY_OPTIONS: {
  optOut: boolean;
  label: string;
  sub: string;
}[] = [
  {
    optOut: false,
    label: "Yes, happy to help",
    sub: "Your emails and contacts are never read or shared. Only anonymised signals — like how you flag and prioritise — help us make Calrix better for everyone.",
  },
  {
    optOut: true,
    label: "Keep my data private",
    sub: "Your data stays entirely private and is never used outside of your own experience.",
  },
];
