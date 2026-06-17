import { Inngest } from "inngest";
import { env } from "@/env";
import type { TriageRunTrigger } from "@/server/db/schema/triage";

export const inngest = new Inngest({
  id: "calrix",
  ...(env.INNGEST_EVENT_KEY && { eventKey: env.INNGEST_EVENT_KEY }),
});

export type TriageUserRequestedEvent = {
  name: "triage/user.requested";
  data: {
    userId: string;
    trigger: TriageRunTrigger;
  };
};

export type EmailReceivedEvent = {
  name: "email/received";
  data: {
    userId: string;
    messageId: string;
  };
};

export type ActionAutopilotRequestedEvent = {
  name: "action/autopilot.requested";
  data: {
    userId: string;
    actionItemId: string;
  };
};
