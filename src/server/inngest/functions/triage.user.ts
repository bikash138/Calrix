import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { inngest } from "../client";
import { notificationChannel } from "../channels";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import {
  ActionCategory,
  ActionUrgency,
  AutonomyLevel,
  ThreadTrackingStatus,
  TriageRunStatus,
  actionItems,
  threadTracking,
  triageRuns,
} from "@/server/db/schema/triage";
import { getTriageClassifierPrompt } from "@/server/ai/prompts/triage-classifier.prompt";
import { getTriageAutonomyPrompt } from "@/server/ai/prompts/triage-autonomy.prompt";
import { getEmailComposerPrompt } from "@/server/ai/prompts/email-composer.prompt";
import { getMeetingExtractorPrompt } from "@/server/ai/prompts/meeting-extractor.prompt";
import { stripMarkdown } from "@/server/lib/utils/strip-markdown";
import {
  checkAvailability,
  findFreeSlots,
  type Slot,
} from "@/server/module/calendar/check-availability.service";
import { settingsRepo } from "@/server/module/settings/settings.repo";
import {
  DEFAULT_CALENDAR,
  DEFAULT_TIMEZONE,
} from "@/server/db/schema/settings";
import { user } from "@/server/db/schema/auth";

type MeetingContext = { intent: string; proposedSlot: Slot | null };

type WithHeaders = {
  payload?: { headers?: Array<{ name?: string; value?: string }> };
};

function header(msg: WithHeaders, name: string): string {
  return (
    msg.payload?.headers?.find(
      (h) => h.name?.toLowerCase() === name.toLowerCase(),
    )?.value ?? ""
  );
}

const LLMCategory = z.enum(["reply", "approval", "meeting", "informational"]);

const ClassifiedItemSchema = z.object({
  index: z.number(),
  category: LLMCategory,
  urgency: z.enum(["critical", "high", "normal"]),
  aiSummary: z.string(),
  deadline: z.string().nullable(),
  suggestedAction: z.string(),
});

export const triageUser = inngest.createFunction(
  {
    id: "triage-user",
    name: "Triage User Inbox",
    triggers: [{ event: "triage/user.requested" as const }],
    onFailure: async ({ event, step, error }) => {
      const userId = event.data.event.data.userId;
      await step.realtime.publish(
        "progress-failed",
        notificationChannel({ userId })["triage-progress"],
        {
          status: "failed",
          error: error?.message ?? "Triage failed",
        },
      );
    },
  },
  async ({ event, step }) => {
    const { userId, trigger } = event.data;

    const progress = notificationChannel({ userId })["triage-progress"];

    await step.realtime.publish("progress-started", progress, {
      status: "started",
      phase: "Fetching your inbox…",
    });

    // ── Step 1: Fetch inbox (category:primary) + sent since last completed run ──
    const emails = await step.run("fetch-emails", async () => {
      const lastRun = await db
        .select({ finishedAt: triageRuns.finishedAt })
        .from(triageRuns)
        .where(
          and(
            eq(triageRuns.userId, userId),
            eq(triageRuns.status, TriageRunStatus.COMPLETED),
          ),
        )
        .orderBy(desc(triageRuns.finishedAt))
        .limit(1);

      const since =
        lastRun[0]?.finishedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
      const afterUnix = Math.floor(since.getTime() / 1000);

      const tenant = corsair.withTenant(userId);

      const [inboxList, sentList] = await Promise.all([
        tenant.gmail.api.messages.list({
          q: `in:inbox category:primary after:${afterUnix}`,
          maxResults: 20,
        }),
        tenant.gmail.api.messages.list({
          q: `in:sent after:${afterUnix}`,
          maxResults: 10,
        }),
      ]);

      const inboxIds = inboxList.messages ?? [];
      const sentIds = sentList.messages ?? [];

      const [inbox, sent] = await Promise.all([
        Promise.all(
          inboxIds.map((m) =>
            tenant.gmail.api.messages.get({
              id: m.id!,
              format: "metadata",
            }),
          ),
        ),
        Promise.all(
          sentIds.map((m) =>
            tenant.gmail.api.messages.get({
              id: m.id!,
              format: "metadata",
            }),
          ),
        ),
      ]);

      return {
        inbox: inbox.map((msg) => ({
          id: msg.id!,
          threadId: msg.threadId!,
          subject: header(msg, "Subject") || "(no subject)",
          from: header(msg, "From"),
          to: header(msg, "To"),
          date: header(msg, "Date"),
          snippet: msg.snippet ?? "",
          labelIds: msg.labelIds ?? [],
        })),
        sent: sent.map((msg) => ({
          id: msg.id!,
          threadId: msg.threadId!,
          subject: header(msg, "Subject") || "(no subject)",
          from: header(msg, "From"),
          to: header(msg, "To"),
          date: header(msg, "Date"),
          snippet: msg.snippet ?? "",
        })),
      };
    });

    await step.realtime.publish("progress-classifying", progress, {
      status: "running",
      phase: `Analyzing ${emails.inbox.length} email${emails.inbox.length === 1 ? "" : "s"}…`,
    });

    // ── Step 2: Batch classify inbox
    const classified = await step.run("classify", async () => {
      if (emails.inbox.length === 0) return { items: [], tokensUsed: 0 };

      const { output: object, usage } = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({
          schema: z.object({
            items: z.array(ClassifiedItemSchema),
          }),
        }),
        system: getTriageClassifierPrompt(),
        prompt: emails.inbox
          .map(
            (m, i) =>
              `[${i}] From: ${m.from}\nSubject: ${m.subject}\nSnippet: ${m.snippet}`,
          )
          .join("\n\n"),
      });

      const actionable = object.items
        .filter((item) => item.category !== "informational")
        .map((item) => {
          const msg = emails.inbox[item.index]!;
          return {
            messageId: msg.id,
            threadId: msg.threadId,
            subject: msg.subject,
            sender: msg.from,
            category: item.category as "reply" | "approval" | "meeting",
            urgency: item.urgency,
            aiSummary: item.aiSummary,
            deadline: item.deadline,
            suggestedAction: item.suggestedAction,
          };
        });

      return {
        items: actionable,
        tokensUsed: usage.totalTokens,
      };
    });

    // ── Step 3: Autonomy scoring
    const scored = await step.run("score-autonomy", async () => {
      if (classified.items.length === 0) return { items: [], tokensUsed: 0 };

      const AutonomyItemSchema = z.object({
        index: z.number(),
        autonomy: z.enum(["needs_review", "needs_approval"]),
        autonomyReason: z.string(),
        riskFactors: z.array(z.string()),
      });

      const { output, usage } = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({
          schema: z.object({ items: z.array(AutonomyItemSchema) }),
        }),
        system: getTriageAutonomyPrompt(),
        prompt: classified.items
          .map(
            (item, i) =>
              `[${i}] Category: ${item.category}\nFrom: ${item.sender}\nSubject: ${item.subject}\nSummary: ${item.aiSummary}\nProposed action: ${item.suggestedAction}`,
          )
          .join("\n\n"),
      });

      const itemsWithAutonomy = output.items.map((scored) => ({
        ...classified.items[scored.index]!,
        autonomy: scored.autonomy as AutonomyLevel,
        autonomyReason: scored.autonomyReason,
        riskFactors: scored.riskFactors,
      }));

      return {
        items: itemsWithAutonomy,
        tokensUsed: usage.totalTokens,
      };
    });

    // ── Step 3.5: Calendar-aware context for meeting items ─────────────────────
    const meetingCtx = await step.run("meeting-availability", async () => {
      const meetingItems = scored.items.filter((i) => i.category === "meeting");
      const byMessageId: Record<string, MeetingContext> = {};
      if (meetingItems.length === 0) return { byMessageId };

      const prefs =
        (await settingsRepo.findByUserId(userId))?.calendar ?? DEFAULT_CALENDAR;
      const tz = prefs.timezone || DEFAULT_TIMEZONE;
      const now = new Date();
      const currentDate = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        dateStyle: "full",
      }).format(now);

      const humanSlot = (iso: string): string =>
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(iso));
      const listSlots = (slots: Slot[]): string =>
        slots.map((s) => humanSlot(s.start)).join("; ") || "no openings found";

      const snippetById = new Map(emails.inbox.map((m) => [m.id, m.snippet]));

      // No .default()/.optional() here — OpenAI strict structured output
      // requires every property to be in `required`. Apply fallbacks after.
      const ExtractSchema = z.object({
        hasConcreteTime: z.boolean(),
        durationMins: z.number(),
        slots: z.array(z.object({ start: z.string(), end: z.string() })),
      });

      await Promise.all(
        meetingItems.map(async (item) => {
          const snippet = snippetById.get(item.messageId) ?? "";
          const { output: ex } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({ schema: ExtractSchema }),
            system: getMeetingExtractorPrompt(currentDate, tz),
            prompt: `Subject: ${item.subject}\nFrom: ${item.sender}\nEmail: ${snippet}\nSummary: ${item.aiSummary}`,
          });

          const durationMins = ex.durationMins > 0 ? ex.durationMins : 30;

          // No specific time proposed → offer the user's next open slots.
          if (!ex.hasConcreteTime || ex.slots.length === 0) {
            const open = await findFreeSlots(
              userId,
              prefs,
              now.toISOString(),
              durationMins,
            );
            byMessageId[item.messageId] = {
              intent: `The sender wants to meet but gave no specific time. Propose these open slots and ask them to confirm one: ${listSlots(open)}.`,
              proposedSlot: null,
            };
            return;
          }

          const proposed = ex.slots[0]!;
          const result = await checkAvailability(userId, prefs, proposed);

          if (result.isFree) {
            byMessageId[item.messageId] = {
              intent: `Accept the meeting and confirm the time: ${humanSlot(proposed.start)}.`,
              proposedSlot: proposed,
            };
          } else {
            const conflictNames =
              result.conflicts.map((c) => c.title).join(", ") ||
              "another event";
            byMessageId[item.messageId] = {
              intent: `You are NOT free at ${humanSlot(proposed.start)} (conflicts with ${conflictNames}). Politely say that time doesn't work and propose these alternatives: ${listSlots(result.suggestedSlots)}.`,
              proposedSlot: null,
            };
          }
        }),
      );

      return { byMessageId };
    });

    if (scored.items.length > 0) {
      await step.realtime.publish("progress-drafting", progress, {
        status: "running",
        phase: `Drafting ${scored.items.length} repl${scored.items.length === 1 ? "y" : "ies"}…`,
      });
    }

    // ── Step 4: Pre-draft replies the actionable items
    const drafted = await step.run("pre-draft", async () => {
      if (scored.items.length === 0) return { items: [], tokensUsed: 0 };

      const userRow = await db
        .select({ name: user.name, userPreferences: user.userPreferences })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      const userName = userRow[0]?.name ?? "the user";
      const signature = userRow[0]?.userPreferences?.inbox?.signature;

      const drafts = await Promise.all(
        scored.items.map(async (item) => {
          const meeting =
            item.category === "meeting"
              ? meetingCtx.byMessageId[item.messageId]
              : undefined;
          const intent = meeting
            ? meeting.intent
            : `${item.suggestedAction}. Context: ${item.aiSummary}`;

          const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            system: getEmailComposerPrompt(userName, signature),
            prompt: `Write a reply email to ${item.sender}.\nIntent: ${intent}`,
          });

          let draftReply: string;
          try {
            const parsed = JSON.parse(text) as {
              subject: string;
              body: string;
            };
            draftReply = parsed.body;
          } catch {
            draftReply = text;
          }

          return {
            ...item,
            draftReply: stripMarkdown(draftReply),
            proposedSlot: meeting?.proposedSlot ?? null,
          };
        }),
      );

      return {
        items: drafts,
        tokensUsed: drafts.length,
      };
    });

    // ── Step 5: Derive waiting / overdue from thread_tracking ──────────────────
    const tracked = await step.run("derive-waiting-overdue", async () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      // Threads we received replies to in this run
      const inboxThreadSet = new Set(emails.inbox.map((m) => m.threadId));

      // Sent emails indexed by threadId — used to resolve subject / recipient
      // for threads that appear in the current window
      const sentByThread = new Map(emails.sent.map((m) => [m.threadId, m]));

      const openTracked = await db
        .select()
        .from(threadTracking)
        .where(
          and(
            eq(threadTracking.userId, userId),
            eq(threadTracking.expectsReply, true),
            eq(threadTracking.replyReceived, false),
            eq(threadTracking.status, ThreadTrackingStatus.OPEN),
          ),
        );

      const repliedThreadIds: string[] = [];
      const waitingItems: {
        threadId: string;
        messageId: string;
        subject: string;
        recipient: string;
        category: ActionCategory;
        urgency: ActionUrgency;
        dueDate: Date | null;
        commitmentText: string | null;
        lastSentAt: Date | null;
      }[] = [];

      for (const t of openTracked) {
        // Reply came in during this run — mark for fulfillment in step 6
        if (inboxThreadSet.has(t.threadId)) {
          repliedThreadIds.push(t.threadId);
          continue;
        }

        const sentMsg = sentByThread.get(t.threadId);
        const subject = sentMsg?.subject ?? "(tracked thread)";
        const recipient = sentMsg?.to ?? "";
        const messageId = sentMsg?.id ?? t.id;

        const isPastDue = t.dueDate != null && t.dueDate < now;
        const isStale = t.lastSentAt != null && t.lastSentAt < threeDaysAgo;
        const category =
          isPastDue || isStale
            ? ActionCategory.OVERDUE
            : ActionCategory.WAITING;
        const urgency = isPastDue ? ActionUrgency.HIGH : ActionUrgency.NORMAL;

        waitingItems.push({
          threadId: t.threadId,
          messageId,
          subject,
          recipient,
          category,
          urgency,
          dueDate: t.dueDate ?? null,
          commitmentText: t.commitmentText ?? null,
          lastSentAt: t.lastSentAt ?? null,
        });
      }

      return { waitingItems, repliedThreadIds };
    });

    // ── Step 6: Persist action_items + upsert threadTracking
    await step.run("persist", async () => {
      const now = new Date();

      // 1. Upsert action items for reply/approval/meeting (with draft replies).
      // Dedupe by messageId so a duplicated classifier index can't put the same
      // (user_id, message_id) conflict key twice in one insert.
      const seenMessageIds = new Set<string>();
      const uniqueDrafts = drafted.items.filter((item) => {
        if (seenMessageIds.has(item.messageId)) return false;
        seenMessageIds.add(item.messageId);
        return true;
      });

      if (uniqueDrafts.length > 0) {
        await db
          .insert(actionItems)
          .values(
            uniqueDrafts.map((item) => ({
              userId,
              threadId: item.threadId,
              messageId: item.messageId,
              category: item.category,
              urgency: item.urgency,
              sender: item.sender,
              subject: item.subject,
              aiSummary: item.aiSummary,
              deadline: item.deadline ? new Date(item.deadline) : null,
              suggestedAction: item.suggestedAction,
              draftReply: item.draftReply,
              proposedSlot: item.proposedSlot ?? null,
              autonomy: item.autonomy,
              autonomyReason: item.autonomyReason,
              riskFactors: item.riskFactors,
            })),
          )
          .onConflictDoUpdate({
            target: [actionItems.userId, actionItems.messageId],
            set: {
              category: sql`excluded.category`,
              urgency: sql`excluded.urgency`,
              aiSummary: sql`excluded.ai_summary`,
              suggestedAction: sql`excluded.suggested_action`,
              draftReply: sql`excluded.draft_reply`,
              proposedSlot: sql`excluded.proposed_slot`,
              autonomy: sql`excluded.autonomy`,
              autonomyReason: sql`excluded.autonomy_reason`,
              riskFactors: sql`excluded.risk_factors`,
              updatedAt: now,
            },
          });
      }

      // 2. Upsert waiting/overdue items — one action item per tracked thread
      if (tracked.waitingItems.length > 0) {
        await db
          .insert(actionItems)
          .values(
            tracked.waitingItems.map((item) => ({
              userId,
              threadId: item.threadId,
              messageId: item.messageId,
              category: item.category,
              urgency: item.urgency,
              sender: item.recipient,
              subject: item.subject,
              aiSummary:
                item.commitmentText ?? "Waiting for a reply on this thread.",
              suggestedAction:
                item.category === ActionCategory.OVERDUE
                  ? "Send a follow-up email"
                  : "Awaiting reply — no action needed yet",
              autonomy: AutonomyLevel.NEEDS_REVIEW,
              autonomyReason: "Follow-up decision requires user judgment",
              riskFactors: [] as string[],
            })),
          )
          .onConflictDoUpdate({
            target: [actionItems.userId, actionItems.messageId],
            set: {
              category: sql`excluded.category`,
              urgency: sql`excluded.urgency`,
              updatedAt: now,
            },
          });
      }

      // 3. Upsert threadTracking for each sent email in this window.
      // Dedupe by thread first — multiple sends in one thread would otherwise
      // put two rows with the same (user_id, thread_id) conflict key in a
      // single insert, which Postgres rejects ("ON CONFLICT DO UPDATE command
      // cannot affect row a second time"). Keep the most recent send per thread.
      const latestSentByThread = new Map<
        string,
        (typeof emails.sent)[number]
      >();
      for (const msg of emails.sent) {
        const prev = latestSentByThread.get(msg.threadId);
        const t = msg.date ? new Date(msg.date).getTime() : 0;
        const prevT = prev?.date ? new Date(prev.date).getTime() : 0;
        if (!prev || t >= prevT) latestSentByThread.set(msg.threadId, msg);
      }
      const dedupedSent = [...latestSentByThread.values()];

      if (dedupedSent.length > 0) {
        await db
          .insert(threadTracking)
          .values(
            dedupedSent.map((msg) => ({
              userId,
              threadId: msg.threadId,
              subject: msg.subject,
              recipientEmail: msg.to,
              lastSentAt: msg.date ? new Date(msg.date) : now,
              expectsReply: true,
              replyReceived: false,
            })),
          )
          .onConflictDoUpdate({
            target: [threadTracking.userId, threadTracking.threadId],
            set: {
              lastSentAt: sql`excluded.last_sent_at`,
              subject: sql`excluded.subject`,
              recipientEmail: sql`excluded.recipient_email`,
              updatedAt: now,
            },
          });
      }

      // 4. Mark threads where a reply arrived this run as fulfilled
      for (const threadId of tracked.repliedThreadIds) {
        await db
          .update(threadTracking)
          .set({
            replyReceived: true,
            status: ThreadTrackingStatus.FULFILLED,
            lastInboundAt: now,
            updatedAt: now,
          })
          .where(
            and(
              eq(threadTracking.userId, userId),
              eq(threadTracking.threadId, threadId),
            ),
          );
      }
    });

    const actionableItems = drafted.items.length;
    const waitingItems = tracked.waitingItems.filter(
      (i) => i.category === ActionCategory.WAITING,
    ).length;
    const overdueItems = tracked.waitingItems.filter(
      (i) => i.category === ActionCategory.OVERDUE,
    ).length;

    await step.realtime.publish("progress-completed", progress, {
      status: "completed",
      actionableItems,
      waitingItems,
      overdueItems,
    });

    return {
      userId,
      trigger,
      inboxFetched: emails.inbox.length,
      sentFetched: emails.sent.length,
      actionableItems,
      waitingItems,
      overdueItems,
      tokensUsed: (classified.tokensUsed ?? 0) + (scored.tokensUsed ?? 0),
    };
  },
);
