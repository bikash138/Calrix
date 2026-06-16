export type ShortcutEntry = {
  desc: string;
  primary: string[];
  alt?: string[];
};

export type ColorKey = "amber" | "indigo" | "violet" | "sky" | "rose";

export type ShortcutGroup = {
  id: string;
  title: string;
  color: ColorKey;
  shortcuts: ShortcutEntry[];
};

export const COLOR_STYLES: Record<ColorKey, { dot: string; title: string }> = {
  amber:  { dot: "bg-amber-500",  title: "text-amber-600  dark:text-amber-400"  },
  indigo: { dot: "bg-indigo-500", title: "text-indigo-600 dark:text-indigo-400" },
  violet: { dot: "bg-violet-500", title: "text-violet-600 dark:text-violet-400" },
  sky:    { dot: "bg-sky-500",    title: "text-sky-600    dark:text-sky-400"    },
  rose:   { dot: "bg-rose-500",   title: "text-rose-600   dark:text-rose-400"   },
};

export const KEYBOARD_SHORTCUTS: ShortcutGroup[] = [
  {
    id: "ai",
    title: "Calrix AI",
    color: "amber",
    shortcuts: [
      { desc: "Open Calrix AI",  primary: ["⌘", "K"] },
    ],
  },
  {
    id: "inbox",
    title: "Inbox",
    color: "indigo",
    shortcuts: [
      { desc: "Next email",          primary: ["J"],      alt: ["↓"] },
      { desc: "Previous email",      primary: ["K"],      alt: ["↑"] },
      { desc: "Close reading pane",  primary: ["Esc"]               },
      { desc: "Focus search",        primary: ["/"]                 },
      { desc: "Archive",             primary: ["E"]                 },
      { desc: "Delete",              primary: ["#"]                 },
      { desc: "Star / Unstar",       primary: ["S"]                 },
      { desc: "Mark as unread",      primary: ["U"]                 },
      { desc: "Refresh",             primary: ["⇧", "R"]            },
      { desc: "Show shortcuts",      primary: ["?"]                 },
      { desc: "Filter — All mail",   primary: ["1"]                 },
      { desc: "Filter — Unread",     primary: ["2"]                 },
      { desc: "Filter — Starred",    primary: ["3"]                 },
      { desc: "Filter — Sent",       primary: ["4"]                 },
      { desc: "Filter — Trash",      primary: ["5"]                 },
    ],
  },
  {
    id: "chat",
    title: "Chat",
    color: "violet",
    shortcuts: [
      { desc: "Focus input", primary: ["/"] },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    color: "sky",
    shortcuts: [],
  },
  {
    id: "calendar",
    title: "Calendar",
    color: "rose",
    shortcuts: [],
  },
];
