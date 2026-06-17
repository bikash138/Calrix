import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { inngest } from "../client";
import { notificationChannel } from "../channels";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import {
  ActionCategory,
  ActionUrgency,
  AutonomyLevel,
  actionItems,
} from "@/server/db/schema/triage";

import { sql } from "drizzle-orm";
import { NON_PRIMARY_LABELS } from "@/server/lib/gmail-labels";
import { getTriageAutonomyPrompt } from "@/server/ai/prompts/triage-autonomy.prompt";
import { getTriageClassifierPrompt } from "@/server/ai/prompts/triage-classifier.prompt";

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

const SingleClassifiedSchema = z.object({
  category: z.enum(["reply", "approval", "meeting", "informational"]),
  urgency: z.enum(["critical", "high", "normal"]),
  aiSummary: z.string(),
  deadline: z.string().nullable(),
  suggestedAction: z.string(),
});

const SingleAutonomySchema = z.object({
  autonomy: z.enum(["needs_review", "needs_approval"]),
  autonomyReason: z.string(),
  riskFactors: z.array(z.string()),
});

export const emailReceived = inngest.createFunction(
  {
    id: "email-received",
    name: "Process Received Email",
    triggers: [{ event: "email/received" as const }],
    concurrency: { limit: 5, key: "event.data.userId" },
  },
  async ({ event, step }) => {
    const { userId, messageId } = event.data;

    // ── Step 1: Fetch email metadata
    const email = await step.run("fetch-message", async () => {
      const tenant = corsair.withTenant(userId);
      const msg = await tenant.gmail.api.messages.get({
        id: messageId,
        format: "metadata",
      });

      // Drop anything not in the primary inbox
      const labels = msg.labelIds ?? [];
      const isNonPrimary = labels.some((l) => NON_PRIMARY_LABELS.has(l));
      if (!labels.includes("INBOX") || isNonPrimary) {
        return null;
      }

      return {
        id: msg.id!,
        threadId: msg.threadId!,
        subject: header(msg, "Subject") || "(no subject)",
        from: header(msg, "From"),
        snippet: msg.snippet ?? "",
      };
    });

    // Not a primary inbox email — stop
    if (!email) return { skipped: true, reason: "non-primary" };

    // ── Step 2: Classify (single email, cheap)
    const classified = await step.run("classify", async () => {
      const { output, usage } = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SingleClassifiedSchema }),
        system: getTriageClassifierPrompt(),
        prompt: `From: ${email.from}\nSubject: ${email.subject}\nSnippet: ${email.snippet}`,
      });

      return { ...output, tokensUsed: usage.totalTokens };
    });

    // Informational or not urgent enough — let the daily batch handle it
    if (
      classified.category === "informational" ||
      classified.urgency === "normal" ||
      classified.urgency === "high"
    ) {
      return {
        skipped: true,
        reason: `${classified.category}/${classified.urgency} — deferred to batch`,
      };
    }

    // ── Step 3: Autonomy score
    const scored = await step.run("score-autonomy", async () => {
      const { output, usage } = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SingleAutonomySchema }),
        system: getTriageAutonomyPrompt(),
        prompt: `Category: ${classified.category}\nFrom: ${email.from}\nSubject: ${email.subject}\nSummary: ${classified.aiSummary}\nProposed action: ${classified.suggestedAction}`,
      });

      return { ...output, tokensUsed: usage.totalTokens };
    });

    // ── Step 4: Insert action item (no draft — dashboard shows summary) ─────
    await step.run("persist", async () => {
      await db
        .insert(actionItems)
        .values({
          userId,
          threadId: email.threadId,
          messageId: email.id,
          category: classified.category as ActionCategory,
          urgency: ActionUrgency.CRITICAL,
          sender: email.from,
          subject: email.subject,
          aiSummary: classified.aiSummary,
          deadline: classified.deadline ? new Date(classified.deadline) : null,
          suggestedAction: classified.suggestedAction,
          autonomy: scored.autonomy as AutonomyLevel,
          autonomyReason: scored.autonomyReason,
          riskFactors: scored.riskFactors,
        })
        .onConflictDoUpdate({
          target: [actionItems.userId, actionItems.messageId],
          set: {
            urgency: sql`excluded.urgency`,
            aiSummary: sql`excluded.ai_summary`,
            suggestedAction: sql`excluded.suggested_action`,
            autonomy: sql`excluded.autonomy`,
            autonomyReason: sql`excluded.autonomy_reason`,
            riskFactors: sql`excluded.risk_factors`,
            updatedAt: new Date(),
          },
        });
    });

    // ── Step 5: Notify dashboard via Inngest Realtime
    await step.realtime.publish(
      "notify-urgent-email",
      notificationChannel({ userId })["urgent-email"],
      {
        messageId: email.id,
        from: email.from,
        subject: email.subject,
        urgency: ActionUrgency.CRITICAL,
        category: classified.category as "reply" | "approval" | "meeting",
        aiSummary: classified.aiSummary,
      },
    );

    return {
      processed: true,
      messageId: email.id,
      category: classified.category,
    };
  },
);
