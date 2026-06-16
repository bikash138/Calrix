export type SecuritySection = {
  title: string;
  body: string;
};

export const SECTIONS: SecuritySection[] = [
  {
    title: "What we collect",
    body: `When you connect your Google account, Calrix requests access to your Gmail and Google Calendar. We read email metadata (sender, subject, timestamp) and calendar events to power triage, drafting, and scheduling features. We do not store the full body of your emails on our servers beyond what is necessary to complete an action you have requested.`,
  },
  {
    title: "How we use your data",
    body: `Your data is used solely to provide the Calrix service — triaging your inbox, drafting replies in your voice, scheduling meetings, and surfacing follow-ups. We do not sell your data, use it for advertising, or share it with third parties except as required to operate the service (e.g. our AI inference provider processes requests under strict data-processing agreements).`,
  },
  {
    title: "AI processing",
    body: `Calrix uses large language models to analyse and act on your email and calendar data. Prompts sent to our AI provider include only the minimum context needed to complete each action. We do not use your personal data to train foundation models.`,
  },
  {
    title: "Data retention",
    body: `Action logs are retained for 90 days so you can review what Calrix did on your behalf. You can request deletion of your data at any time by contacting us. On account deletion we permanently remove all stored data within 30 days.`,
  },
  {
    title: "Security",
    body: `All data is encrypted in transit (TLS 1.3) and at rest (AES-256). OAuth tokens are stored encrypted and are never logged. We undergo regular security reviews and follow industry-standard practices for access control and incident response.`,
  },
  {
    title: "Your controls",
    body: `You can revoke Calrix's Google account access at any time from your Google Account permissions page. You can also disconnect your account from within Calrix settings. Once revoked, Calrix will no longer read or act on your Gmail or Calendar.`,
  },
  {
    title: "Contact",
    body: `If you have questions about how we handle your data, email us at privacy@calrix.ai. We aim to respond within 2 business days.`,
  },
];
