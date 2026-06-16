import { corsair } from "@/server/corsair";

import { type InboxAction } from "./patch-inbox-email.schema";

export type { InboxAction };

const ACTION_LABELS: Record<
  InboxAction,
  { addLabelIds?: string[]; removeLabelIds?: string[] }
> = {
  markRead:   { removeLabelIds: ["UNREAD"] },
  markUnread: { addLabelIds: ["UNREAD"] },
  star:       { addLabelIds: ["STARRED"] },
  unstar:     { removeLabelIds: ["STARRED"] },
  archive:    { removeLabelIds: ["INBOX"] },
  trash:      { addLabelIds: ["TRASH"], removeLabelIds: ["INBOX"] },
};

export async function patchInboxEmail(
  userId: string,
  threadId: string,
  action: InboxAction,
): Promise<void> {
  const tenant = corsair.withTenant(userId);

  const thread = await tenant.gmail.api.threads.get({
    id: threadId,
    format: "minimal",
  });

  const ids = (thread.messages ?? []).map((m) => m.id!).filter(Boolean);

  await tenant.gmail.api.messages.batchModify({ ids, ...ACTION_LABELS[action] });
}
