export type Tab = {
  label: string;
  heading: string;
  tagline: string;
  points: { title: string; body: string }[];
  card: {
    title: string;
    code: string;
    statusLabel: string;
    statusValue: string;
  };
};

export const TABS: Tab[] = [
  {
    label: "Inbox",
    heading: "Inbox Zero, On Autopilot",
    tagline: "Sort it. Draft it. Done.",
    points: [
      {
        title: "Triage Everything",
        body: "Calrix reads, labels, and ranks every email so you open only what actually needs you.",
      },
      {
        title: "Drafts That Sound Like You",
        body: "Replies written in your voice, ready to send. Approve in a click or auto-send the routine ones.",
      },
    ],
    card: {
      title: "Inbox Triage",
      code: "INB-2048",
      statusLabel: "Status:",
      statusValue: "Cleared 142 emails today, +63% faster.",
    },
  },
  {
    label: "Calendar",
    heading: "A Calendar That Defends Itself",
    tagline: "Protect your time. Automatically.",
    points: [
      {
        title: "No More Back-and-Forth",
        body: "Calrix finds the slot, sends the invite, and reschedules conflicts before they reach you.",
      },
      {
        title: "Focus Time, Guarded",
        body: "Deep-work blocks that hold their ground against meeting creep, every single week.",
      },
    ],
    card: {
      title: "Smart Scheduling",
      code: "CAL-0099",
      statusLabel: "Status:",
      statusValue: "Reclaimed 6.5 hrs of focus this week.",
    },
  },
  {
    label: "Follow-ups",
    heading: "Never Drop the Ball Again",
    tagline: "It remembers, so you don't.",
    points: [
      {
        title: "Chases Replies for You",
        body: "Polite nudges sent on the right cadence until you finally get an answer.",
      },
      {
        title: "Surfaces What's Stuck",
        body: "See every thread waiting on someone, ranked by what matters most right now.",
      },
    ],
    card: {
      title: "Follow-ups",
      code: "FUP-3120",
      statusLabel: "Status:",
      statusValue: "Recovered 28 stalled threads, +98% reply rate.",
    },
  },
  {
    label: "Meetings",
    heading: "Walk In Fully Briefed",
    tagline: "Prep done before you sit down.",
    points: [
      {
        title: "Context On Tap",
        body: "A one-page brief on every attendee and thread, ready minutes before you join.",
      },
      {
        title: "Notes & Actions, Captured",
        body: "Summaries and action items land in your inbox the moment the meeting ends.",
      },
    ],
    card: {
      title: "Meeting Prep",
      code: "MTG-7741",
      statusLabel: "Status:",
      statusValue: "Saved 4.2 hrs of prep this week.",
    },
  },
  {
    label: "Insights",
    heading: "See the Whole Picture",
    tagline: "Clarity, not more dashboards.",
    points: [
      {
        title: "Know Where Time Goes",
        body: "Where your week actually went, across email and calendar, in plain numbers.",
      },
      {
        title: "Decide with Real Data",
        body: "Spot overload early and rebalance before it quietly burns the team out.",
      },
    ],
    card: {
      title: "Workload Insights",
      code: "EXE-40091",
      statusLabel: "Status:",
      statusValue: "Running focus is up +98% this week.",
    },
  },
];
