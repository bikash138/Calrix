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
    label: "Calrix AI",
    heading: "Your Inbox, By Conversation",
    tagline: "Just ask. It handles the rest.",
    points: [
      {
        title: "Plain-English Control",
        body: "Ask Calrix to find, reply, schedule, or reschedule in your own words. It reads your mail and calendar and acts.",
      },
      {
        title: "Confirms Before It Sends",
        body: "Drafts and events come back as a quick review card, so nothing leaves without your okay.",
      },
    ],
    card: {
      title: "Calrix Assistant",
      code: "CHT-0001",
      statusLabel: "Status:",
      statusValue: "Handled 37 requests today, zero misfires.",
    },
  },
  {
    label: "Actions",
    heading: "Every Email, Triaged Into a To-Do List",
    tagline: "Know what needs you, instantly.",
    points: [
      {
        title: "Sorted & Ranked For You",
        body: "Each email is classified into reply, approval, meetings and ranked by urgency, with a one-line AI summary.",
      },
      {
        title: "Drafts and Autonomy Built In",
        body: "Every item arrives with a ready-to-send draft and an autonomy level you control: review it, or let it run.",
      },
    ],
    card: {
      title: "Action Queue",
      code: "ACT-1107",
      statusLabel: "Status:",
      statusValue: "9 actions surfaced, 6 cleared in one pass.",
    },
  },
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
        title: "Knows Who You Mean",
        body: "Just say the name, Calrix remembers your contacts and resolves it to the right email automatically.",
      },
    ],
    card: {
      title: "Follow-ups",
      code: "FUP-3120",
      statusLabel: "Status:",
      statusValue: "Recovered 28 stalled threads, +98% reply rate.",
    },
  },
];
