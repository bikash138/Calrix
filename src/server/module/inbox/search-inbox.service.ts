import { corsair } from "@/server/corsair";
import { getHeader, parseFrom } from "@/server/lib/utils/gmail";

import type { ThreadRow } from "./get-inbox-email.schema";

export async function searchInbox(
  userId: string,
  q: string,
): Promise<ThreadRow[]> {
  const tenant = corsair.withTenant(userId);

  const list = await tenant.gmail.api.threads.list({ q, maxResults: 8 });
  const threads = list.threads ?? [];
  if (threads.length === 0) return [];

  const detailed = await Promise.all(
    threads.map((t) =>
      tenant.gmail.api.threads.get({ id: t.id!, format: "metadata" }),
    ),
  );

  return detailed.map((thread) => {
    const messages = thread.messages ?? [];
    const first = messages[0];
    const last = messages[messages.length - 1] ?? first;

    const { name: senderName, email: senderEmail } = parseFrom(
      getHeader(last?.payload?.headers, "From"),
    );

    return {
      id: thread.id!,
      subject: getHeader(first?.payload?.headers, "Subject") || "(no subject)",
      senderName,
      senderEmail,
      date: last?.internalDate
        ? new Date(Number(last.internalDate)).toISOString()
        : null,
      snippet: thread.snippet ?? "",
      unread: messages.some((m) => m.labelIds?.includes("UNREAD")),
      starred: messages.some((m) => m.labelIds?.includes("STARRED")),
      messageCount: messages.length,
    };
  });
}
