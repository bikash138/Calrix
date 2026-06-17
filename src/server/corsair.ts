import { gmail, type MessageReceivedEvent } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { createCorsair } from "corsair";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { conn, db } from "./db";
import { user } from "./db/schema/auth";
import { inngest } from "./inngest/client";

export const corsair = createCorsair({
  multiTenancy: true,
  plugins: [
    gmail({
      webhookHooks: {
        messageChanged: {
          after: async (_ctx, result) => {
            if (!result?.data || result.data.type !== "messageReceived") return;

            const event = result.data as MessageReceivedEvent;

            // Resolve userId from the emailAddress in the event
            const userRow = await db
              .select({ id: user.id })
              .from(user)
              .where(eq(user.email, event.emailAddress))
              .limit(1);

            if (!userRow[0]) return;
            const userId = userRow[0].id;

            // corsair delivers an empty `message` (only emailAddress + historyId),
            // so resolve the newest INBOX message ourselves. The watch is
            // INBOX-scoped and each new mail fires its own push, so the latest
            // INBOX message is the one that triggered this. The email/received
            // pipeline does the authoritative label + relevance filtering.
            const tenant = corsair.withTenant(userId);
            const list = await tenant.gmail.api.messages.list({
              labelIds: ["INBOX"],
              maxResults: 1,
            });
            const messageId = list.messages?.[0]?.id;
            if (!messageId) return;

            await inngest.send({
              name: "email/received" as const,
              data: { userId, messageId },
            });
          },
        },
      },
    }),
    googlecalendar(),
  ],
  database: conn,
  kek: env.CORSAIR_KEK,
});
