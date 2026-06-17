import { eq } from "drizzle-orm";
import { inngest } from "../client";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";
import { getHeader } from "@/server/lib/utils/gmail";
import { settingsRepo } from "@/server/module/settings/settings.repo";
import { EmailVolume } from "@/server/db/schema/settings";
import { contactsRepo } from "@/server/module/contacts/contacts.repo";
import { isHarvestableContact } from "@/server/module/contacts/contact-filter";
import {
  parseAddressList,
  type ParsedAddress,
} from "@/server/module/contacts/parse-address";

/**
 * How many recent sent messages to scan, derived from the user's onboarding
 * "email volume" preference — lighter accounts scan less to save bandwidth.
 */
const SENT_SCAN_LIMIT: Record<EmailVolume, number> = {
  [EmailVolume.UNDER_20]: 25,
  [EmailVolume.RANGE_20_50]: 50,
  [EmailVolume.RANGE_50_100]: 100,
  [EmailVolume.OVER_100]: 200,
};
const DEFAULT_SCAN_LIMIT = 50;

/**
 * Seeds the contacts book from the user's SENT mail — recipients of mail the
 * user wrote are real humans, so this stays free of newsletter/no-reply noise.
 * Idempotent (upserts), safe to re-run.
 */
export const contactsSync = inngest.createFunction(
  {
    id: "contacts-sync",
    name: "Sync Contacts from Sent Mail",
    triggers: [{ event: "contacts/sync" as const }],
    concurrency: { limit: 3, key: "event.data.userId" },
  },
  async ({ event, step }) => {
    const { userId } = event.data;

    const selfEmail = await step.run("self-email", async () => {
      const row = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      return row[0]?.email ?? null;
    });

    const messageIds = await step.run("list-sent", async () => {
      const tenant = corsair.withTenant(userId);

      // Scan-Depth follows the user's onboarding email-volume preference.
      const prefs = await settingsRepo.findByUserId(userId);
      const volume = prefs?.ai.volume ?? null;
      const maxResults = volume ? SENT_SCAN_LIMIT[volume] : DEFAULT_SCAN_LIMIT;

      // Mirror the inbox service: list by SENT label (no `q`).
      const res = await tenant.gmail.api.messages.list({
        labelIds: ["SENT"],
        maxResults,
      });
      return (res.messages ?? [])
        .map((m) => m.id)
        .filter((id): id is string => Boolean(id));
    });

    if (messageIds.length === 0) {
      return { harvested: 0, scanned: 0, parsed: 0 };
    }

    const result = await step.run("harvest-recipients", async () => {
      const tenant = corsair.withTenant(userId);
      const found: ParsedAddress[] = [];
      let parsed = 0;

      for (const id of messageIds) {
        const msg = await tenant.gmail.api.messages.get({
          id,
          format: "metadata",
        });
        const recipients = [
          ...parseAddressList(getHeader(msg.payload?.headers, "To")),
          ...parseAddressList(getHeader(msg.payload?.headers, "Cc")),
        ];
        parsed += recipients.length;
        for (const r of recipients) {
          if (isHarvestableContact(r.email, selfEmail ?? undefined)) {
            found.push(r);
          }
        }
      }

      await contactsRepo.upsertMany(userId, found);
      const stored = await contactsRepo.countForUser(userId);
      return { harvested: found.length, parsed, stored };
    });

    return {
      harvested: result.harvested,
      parsed: result.parsed,
      stored: result.stored,
      scanned: messageIds.length,
    };
  },
);
