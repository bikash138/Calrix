export type Plan = {
  name: string;
  tagline: string;
  oldPrice?: string;
  price?: string;
  priceNote?: string;
  highlight?: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    name: "Pilot",
    tagline: "Prove the value on one inbox, fast.",
    oldPrice: "$99",
    priceNote: "/ month",
    highlight: "On us for the first 10 founding users.",
    features: ["1 connected inbox + calendar", "AI usage: 500 actions / month", "Smart triage & on-brand drafts", "Automated follow-ups", "Email support"],
    cta: "Try it Out",
  },
  {
    name: "Team",
    tagline: "Put your whole team on autopilot.",
    price: "$199",
    priceNote: "/ month",
    features: ["Up to 7 seats", "AI usage: 5,000 actions / month", "Shared scheduling & routing", "Meeting prep & summaries", "Priority support", "Add seats: + $25 / seat / month"],
    featured: true,
    cta: "Get Started",
  },
  {
    name: "Scale",
    tagline: "For orgs that live in the inbox.",
    price: "Custom",
    features: ["Unlimited seats", "Custom AI usage limits", "SSO & advanced security", "Dedicated success manager", "Onboarding & SLA"],
    cta: "Book a Call",
  },
];
