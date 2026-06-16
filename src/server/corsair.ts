import { gmail, type MessageReceivedEvent } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { createCorsair } from "corsair";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { NON_PRIMARY_LABELS } from "@/lib/gmail-labels";
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
            const labels: string[] =
              (event.message as { labelIds?: string[] }).labelIds ?? [];

            // Drop anything not in the primary inbox
            if (
              !labels.includes("INBOX") ||
              labels.some((l) => NON_PRIMARY_LABELS.has(l))
            ) {
              return;
            }

            const messageId = (event.message as { id?: string }).id;
            if (!messageId) return;

            // Resolve userId from the emailAddress in the event
            const userRow = await db
              .select({ id: user.id })
              .from(user)
              .where(eq(user.email, event.emailAddress))
              .limit(1);

            if (!userRow[0]) return;

            await inngest.send({
              name: "email/received" as const,
              data: { userId: userRow[0].id, messageId },
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
