import { corsair } from "@/server/corsair";
import { getHeader, parseFrom } from "@/server/lib/utils/gmail";

import type { InboxFilter, InboxListPage } from "./get-inbox-email.schema";

const FILTER_CONFIG: Record<InboxFilter, { labelIds: string[]; q?: string }> = {
  all: { labelIds: ["INBOX"], q: "category:primary" },
  unread: { labelIds: ["INBOX"], q: "category:primary is:unread" },
  starred: { labelIds: ["INBOX"], q: "category:primary is:starred" },
  sent: { labelIds: ["SENT"] },
  trash: { labelIds: ["TRASH"] },
};

export async function getInboxList(
  userId: string,
  filter: InboxFilter,
  pageToken?: string,
): Promise<InboxListPage> {
  const tenant = corsair.withTenant(userId);
  const { labelIds, q } = FILTER_CONFIG[filter];

  const list = await tenant.gmail.api.threads.list({
    labelIds,
    maxResults: 15,
    ...(q && { q }),
    ...(pageToken && { pageToken }),
  });

  const threads = list.threads ?? [];

  const detailed = await Promise.all(
    threads.map((t) =>
      tenant.gmail.api.threads.get({
        id: t.id!,
        format: "metadata",
      }),
    ),
  );

  const rows = detailed.map((thread) => {
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

  return { threads: rows, nextPageToken: list.nextPageToken ?? null };
}
