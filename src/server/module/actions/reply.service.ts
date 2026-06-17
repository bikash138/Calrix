import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, eq } from "drizzle-orm";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";
import {
  ActionCategory,
  ActionStatus,
  threadTracking,
} from "@/server/db/schema/triage";
import { ApiError } from "@/server/errors/api.error";
import { buildRawReply } from "@/server/lib/utils/build-mime";
import { stripMarkdown } from "@/server/lib/utils/strip-markdown";
import { getHeader, parseFrom } from "@/server/lib/utils/gmail";
import { getEmailComposerPrompt } from "@/server/ai/prompts/email-composer.prompt";
import { getInboxEmail } from "@/server/module/inbox/get-inbox-email.service";
import { actionsRepo } from "./actions.repo";

const FOLLOW_UP_CATEGORIES: ActionCategory[] = [
  ActionCategory.WAITING,
  ActionCategory.OVERDUE,
];

/** Load the user's display name + signature for the composer prompt. */
async function loadSender(userId: string) {
  const rows = await db
    .select({
      name: user.name,
      email: user.email,
      userPreferences: user.userPreferences,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const row = rows[0];
  return {
    name: row?.name ?? "the user",
    email: row?.email ?? "",
    signature: row?.userPreferences?.inbox?.signature,
  };
}

/** Flatten a thread into plain text the composer can match tone against. */
function buildThreadContext(
  messages: {
    senderName: string;
    senderEmail: string;
    date: string | null;
    textBody: string;
  }[],
): string {
  return messages
    .map(
      (m) =>
        `From: ${m.senderName} <${m.senderEmail}>${m.date ? ` (${m.date})` : ""}\n${m.textBody.trim()}`,
    )
    .join("\n\n---\n\n")
    .slice(0, 6000);
}

/** Category-aware intent for the composer. */
function buildIntent(
  category: ActionCategory,
  aiSummary: string,
  suggestedAction: string,
  instruction?: string,
  currentDraft?: string,
): string {
  let intent: string;
  if (category === ActionCategory.OVERDUE) {
    intent = `Write a follow-up requesting a reply on this thread — it is overdue. Context: ${aiSummary}`;
  } else if (category === ActionCategory.WAITING) {
    intent = `Write a polite reminder gently nudging for a reply on this thread. Context: ${aiSummary}`;
  } else {
    intent = `${suggestedAction}. Context: ${aiSummary}`;
  }
  if (currentDraft?.trim()) {
    intent += `\n\nImprove this existing draft, keeping what works:\n${currentDraft.trim()}`;
  }
  if (instruction?.trim()) {
    intent += `\n\nAdditional instruction from the user: ${instruction.trim()}`;
  }
  return intent;
}

/**
 * Generate (or refine) a draft reply/follow-up for an action item and persist
 * it to `draftReply`. Used by both the "Draft reply" and "Improve" buttons.
 */
export async function composeReply(
  userId: string,
  actionItemId: string,
  opts: { instruction?: string; currentDraft?: string } = {},
): Promise<{ draft: string }> {
  const item = await actionsRepo.findById(actionItemId, userId);
  if (!item) throw ApiError.notFound("Action item not found");

  const [{ name, signature }, thread] = await Promise.all([
    loadSender(userId),
    getInboxEmail(userId, item.threadId),
  ]);

  const recipientName = parseFrom(item.sender).name;
  const intent = buildIntent(
    item.category,
    item.aiSummary,
    item.suggestedAction,
    opts.instruction,
    opts.currentDraft,
  );

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: getEmailComposerPrompt(name, signature),
    prompt: `Write a reply email to ${recipientName}.\nOriginal subject: ${item.subject}\nIntent: ${intent}\nThread:\n${buildThreadContext(thread.messages)}`,
  });

  let body: string;
  try {
    body = (JSON.parse(text) as { subject: string; body: string }).body;
  } catch {
    body = text;
  }
  body = stripMarkdown(body);

  await actionsRepo.updateDraft(actionItemId, userId, body);
  return { draft: body };
}

/** Strip any leading "Re:" chain, then prefix a single "Re:". */
function replySubject(subject: string): string {
  return `Re: ${subject.replace(/^(re:\s*)+/i, "").trim()}`;
}

/**
 * Send the (possibly user-edited) draft for an action item. Resolves the
 * recipient by category — follow-ups go to the person we were waiting on, not
 * back to ourselves — keeps the reply in-thread, and marks the item actioned.
 */
export async function sendReply(
  userId: string,
  actionItemId: string,
  body: string,
): Promise<void> {
  const item = await actionsRepo.findById(actionItemId, userId);
  if (!item) throw ApiError.notFound("Action item not found");
  if (item.status !== ActionStatus.PENDING) {
    throw ApiError.conflict("This action has already been handled");
  }

  const tenant = corsair.withTenant(userId);
  const sender = await loadSender(userId);

  // Resolve recipient. Waiting/Overdue threads were started by us, so the
  // person to reach is the original recipient — never the last sender (us).
  let to: string;
  if (FOLLOW_UP_CATEGORIES.includes(item.category)) {
    const tracking = await db
      .select({ recipientEmail: threadTracking.recipientEmail })
      .from(threadTracking)
      .where(
        and(
          eq(threadTracking.userId, userId),
          eq(threadTracking.threadId, item.threadId),
        ),
      )
      .limit(1);
    to = tracking[0]?.recipientEmail || parseFrom(item.sender).email;
  } else {
    to = parseFrom(item.sender).email;
  }
  if (!to) throw ApiError.badRequest("Could not resolve a recipient");

  // Pull the last message's Message-ID so the reply threads correctly.
  const thread = await tenant.gmail.api.threads.get({
    id: item.threadId,
    format: "metadata",
  });
  const msgs = thread.messages ?? [];
  const lastMessageId = getHeader(
    msgs[msgs.length - 1]?.payload?.headers,
    "Message-ID",
  );

  const raw = buildRawReply({
    from: sender.email,
    to,
    subject: replySubject(item.subject),
    body,
    inReplyTo: lastMessageId || undefined,
    references: lastMessageId || undefined,
  });

  await tenant.gmail.api.messages.send({ raw, threadId: item.threadId });

  await actionsRepo.markActioned(actionItemId, userId, body);

  // A follow-up resets the "waiting" clock so it doesn't re-surface as overdue.
  if (FOLLOW_UP_CATEGORIES.includes(item.category)) {
    await db
      .update(threadTracking)
      .set({ lastSentAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(threadTracking.userId, userId),
          eq(threadTracking.threadId, item.threadId),
        ),
      );
  }
}
