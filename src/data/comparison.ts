export const COMPARE_COLS = {
  calrix: "Calrix",
  generic: "Generic AI Assistant",
  ea: "Human Assistant",
  status: "Status Quo (Do Nothing)",
};

export type ComparisonRow = {
  label: string;
  calrix: string;
  generic: string;
  ea: string;
  status: string;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Time to set up",
    calrix: "Live in minutes — no training",
    generic: "Constant prompting required",
    ea: "Weeks to hire and onboard",
    status: "Never — you just cope",
  },
  {
    label: "Always on",
    calrix: "24/7 across every inbox",
    generic: "Only when you ask it",
    ea: "Business hours, one timezone",
    status: "Only when you do it",
  },
  {
    label: "Writes in your voice",
    calrix: "Learns your tone from history",
    generic: "Generic — needs heavy editing",
    ea: "Roughly, after months",
    status: "You write every word",
  },
  {
    label: "Calendar control",
    calrix: "Auto-schedules & guards focus",
    generic: "Suggestions only",
    ea: "Manual back-and-forth",
    status: "Endless email tag",
  },
  {
    label: "Follow-ups",
    calrix: "Chases replies automatically",
    generic: "You have to remember",
    ea: "If they remember",
    status: "Things quietly slip",
  },
  {
    label: "Monthly cost",
    calrix: "From $99 / month",
    generic: "Cheap, but all manual",
    ea: "$3,000–6,000 / month",
    status: "Hidden cost of lost hours",
  },
  {
    label: "Privacy & security",
    calrix: "Encrypted, SOC 2-ready",
    generic: "Varies by provider",
    ea: "A person sees everything",
    status: "Scattered across tools",
  },
  {
    label: "Scales with you",
    calrix: "Add seats instantly",
    generic: "More prompting per person",
    ea: "Hire more people",
    status: "Doesn't scale",
  },
];
