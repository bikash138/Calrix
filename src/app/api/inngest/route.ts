import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { triageUser } from "@/server/inngest/functions/triage.user";
import { emailReceived } from "@/server/inngest/functions/email.received";
import { contactsSync } from "@/server/inngest/functions/contacts.sync";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [triageUser, emailReceived, contactsSync],
});
