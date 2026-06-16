import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { setupCorsair } from "corsair/setup";
import { z } from "zod";
import { env } from "@/env";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema/auth";
// import { gmailWatch } from "@/server/db/schema/gmail";
// import { TriageRunTrigger } from "@/server/db/schema/triage";
import { inngest } from "@/server/inngest/client";
import { corsair } from "../corsair";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  user: {
    additionalFields: {
      completedOnboarding: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.labels",
        "https://www.googleapis.com/auth/calendar",
      ],
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (
            account.providerId === "google" &&
            account.accessToken &&
            account.refreshToken
          ) {
            try {
              await setupCorsair(corsair, { tenantId: account.userId });
              const tenant = corsair.withTenant(account.userId);

              await Promise.all([
                tenant.gmail.keys.set_access_token(account.accessToken),
                tenant.gmail.keys.set_refresh_token(account.refreshToken),
                tenant.googlecalendar.keys.set_access_token(
                  account.accessToken,
                ),
                tenant.googlecalendar.keys.set_refresh_token(
                  account.refreshToken,
                ),
              ]);

              const watchRes = await fetch(
                "https://gmail.googleapis.com/gmail/v1/users/me/watch",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    topicName: env.GMAIL_PUBSUB_TOPIC,
                    labelIds: ["INBOX"],
                  }),
                },
              );
              if (watchRes.ok) {
                const watchData = z
                  .object({ expiration: z.string().optional() })
                  .parse(await watchRes.json());
                // await db
                //   .insert(gmailWatch)
                //   .values({
                //     userId: account.userId,
                //     watchExpiry: watchData.expiration
                //       ? new Date(Number(watchData.expiration))
                //       : null,
                //   })
                // .onConflictDoUpdate({
                //   target: [gmailWatch.userId],
                //   set: {
                //     watchExpiry: watchData.expiration
                //       ? new Date(Number(watchData.expiration))
                //       : null,
                //     updatedAt: new Date(),
                //   },
                // });
              } else {
                console.error(
                  "[auth] gmail watch registration failed",
                  await watchRes.text(),
                );
              }

              // inngest
              //   .send({
              //     name: "triage/user.requested",
              //     data: {
              //       userId: account.userId,
              //       trigger: TriageRunTrigger.MANUAL,
              //     },
              //   })
              //   .catch((err) =>
              //     console.error("[auth] inngest send failed", err),
              //   );
            } catch (err) {
              console.error("[auth] account provisioning failed", err);
            }
          }
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId === "google" && account.accessToken) {
            try {
              const tenant = corsair.withTenant(account.userId);
              await tenant.gmail.keys.set_access_token(account.accessToken);
              await tenant.googlecalendar.keys.set_access_token(
                account.accessToken,
              );
              if (account.refreshToken) {
                await tenant.gmail.keys.set_refresh_token(account.refreshToken);
                await tenant.googlecalendar.keys.set_refresh_token(
                  account.refreshToken,
                );
              }
            } catch (err) {
              console.error("[auth] token refresh failed", err);
            }
          }
        },
      },
    },
  },
});
