import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { setupCorsair } from "corsair/setup";
import { z } from "zod";
import { env } from "@/env";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema/auth";
import { gmailWatch } from "@/server/db/schema/gmail";
import { TriageRunTrigger } from "@/server/db/schema/triage";
import { inngest } from "@/server/inngest/client";

import { corsair } from "../corsair";
import { invalidateMcpCache } from "../ai/tools/tool";

/**
 * Google access-token expiry as epoch seconds (corsair's format). Storing this
 * lets corsair reuse a valid cached token instead of force-refreshing on every
 * cold call — which otherwise causes concurrent refreshes of the same refresh
 * token to race and fail intermittently. Falls back to ~58 min from now.
 */
function tokenExpirySeconds(account: {
  accessTokenExpiresAt?: Date | null;
}): string {
  const ms = account.accessTokenExpiresAt
    ? new Date(account.accessTokenExpiresAt).getTime()
    : Date.now() + 3500_000;
  return String(Math.floor(ms / 1000));
}

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
          console.log("[auth:account.create]", {
            providerId: account.providerId,
            userId: account.userId,
            hasAccessToken: !!account.accessToken,
            hasRefreshToken: !!account.refreshToken,
          });
          if (
            account.providerId === "google" &&
            account.accessToken &&
            account.refreshToken
          ) {
            try {
              await setupCorsair(corsair, { tenantId: account.userId });
              const tenant = corsair.withTenant(account.userId);
              const expiresAt = tokenExpirySeconds(account);

              await Promise.all([
                tenant.gmail.keys.set_access_token(account.accessToken),
                tenant.gmail.keys.set_refresh_token(account.refreshToken),
                tenant.gmail.keys.set_expires_at(expiresAt),
                tenant.googlecalendar.keys.set_access_token(
                  account.accessToken,
                ),
                tenant.googlecalendar.keys.set_refresh_token(
                  account.refreshToken,
                ),
                tenant.googlecalendar.keys.set_expires_at(expiresAt),
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
                await db
                  .insert(gmailWatch)
                  .values({
                    userId: account.userId,
                    watchExpiry: watchData.expiration
                      ? new Date(Number(watchData.expiration))
                      : null,
                  })
                  .onConflictDoUpdate({
                    target: [gmailWatch.userId],
                    set: {
                      watchExpiry: watchData.expiration
                        ? new Date(Number(watchData.expiration))
                        : null,
                      updatedAt: new Date(),
                    },
                  });
              } else {
                console.error(
                  "[auth] gmail watch registration failed",
                  await watchRes.text(),
                );
              }

              inngest
                .send({
                  name: "triage/user.requested",
                  data: {
                    userId: account.userId,
                    trigger: TriageRunTrigger.MANUAL,
                  },
                })
                .catch((err) =>
                  console.error("[auth] inngest send failed", err),
                );

              inngest
                .send({
                  name: "contacts/sync",
                  data: { userId: account.userId },
                })
                .catch((err) =>
                  console.error("[auth] contacts sync send failed", err),
                );
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
              const expiresAt = tokenExpirySeconds(account);
              await Promise.all([
                tenant.gmail.keys.set_access_token(account.accessToken),
                tenant.gmail.keys.set_expires_at(expiresAt),
                tenant.googlecalendar.keys.set_access_token(
                  account.accessToken,
                ),
                tenant.googlecalendar.keys.set_expires_at(expiresAt),
              ]);
              if (account.refreshToken) {
                await tenant.gmail.keys.set_refresh_token(account.refreshToken);
                await tenant.googlecalendar.keys.set_refresh_token(
                  account.refreshToken,
                );
              }
              invalidateMcpCache(account.userId);
            } catch (err) {
              console.error("[auth] token refresh failed", err);
            }
          }
        },
      },
    },
  },
});
