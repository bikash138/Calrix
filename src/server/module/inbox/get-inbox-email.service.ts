import { corsair } from "@/server/corsair";
import { getHeader, parseFrom } from "@/server/lib/utils/gmail";

// ── Types ─────────────────────────────────────────────────────────────────────

type PartLike = {
  mimeType?: string;
  filename?: string;
  headers?: Array<{ name?: string; value?: string }>;
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: PartLike[];
};

export type Attachment = {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
};

export type ThreadMessage = {
  id: string;
  senderName: string;
  senderEmail: string;
  to: string;
  subject: string;
  date: string | null;
  textBody: string;
  htmlBody: string;
  attachments: Attachment[];
  unread: boolean;
  starred: boolean;
};

//MIME helpers

function getPartHeader(part: PartLike, name: string): string {
  return (
    part.headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function decodeBase64(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function toStandardBase64(data: string): string {
  return data.replace(/-/g, "+").replace(/_/g, "/");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseMimeTree(root: PartLike): {
  textBody: string;
  htmlBody: string;
  attachments: Attachment[];
} {
  let textBody = "";
  let htmlBody = "";
  const inlineImages: Array<{ cid: string; mimeType: string; data: string }> =
    [];
  const attachments: Attachment[] = [];

  function walk(part: PartLike) {
    const filename = part.filename;
    const contentId = getPartHeader(part, "content-id").replace(/[<>]/g, "");
    const disposition = getPartHeader(part, "content-disposition");

    // Attachment: has filename and is explicitly attached or not an inline image
    if (filename && (disposition.startsWith("attachment") || !contentId)) {
      if (part.body?.attachmentId) {
        attachments.push({
          attachmentId: part.body.attachmentId,
          filename,
          mimeType: part.mimeType ?? "application/octet-stream",
          size: part.body.size ?? 0,
        });
      }
      return;
    }

    // Inline image referenced via cid: in the HTML body
    if (contentId && part.mimeType?.startsWith("image/") && part.body?.data) {
      inlineImages.push({
        cid: contentId,
        mimeType: part.mimeType,
        data: toStandardBase64(part.body.data),
      });
      return;
    }

    // Plain text body (first one wins)
    if (part.mimeType === "text/plain" && part.body?.data && !textBody) {
      textBody = decodeBase64(part.body.data);
      return;
    }

    // HTML body (first one wins)
    if (part.mimeType === "text/html" && part.body?.data && !htmlBody) {
      htmlBody = decodeBase64(part.body.data);
      return;
    }

    // Recurse into multipart containers
    if (part.parts) {
      for (const child of part.parts) {
        walk(child);
      }
    }
  }

  walk(root);

  // Replace all cid: references with inline data: URIs so the iframe renders images
  if (htmlBody && inlineImages.length > 0) {
    for (const img of inlineImages) {
      htmlBody = htmlBody.replace(
        new RegExp(`cid:${escapeRegex(img.cid)}`, "gi"),
        `data:${img.mimeType};base64,${img.data}`,
      );
    }
  }

  return { textBody, htmlBody, attachments };
}

//Service
export async function getInboxEmail(
  userId: string,
  threadId: string,
): Promise<{ id: string; messages: ThreadMessage[] }> {
  const tenant = corsair.withTenant(userId);

  const thread = await tenant.gmail.api.threads.get({
    id: threadId,
    format: "full",
  });

  const messages = (thread.messages ?? []).map((msg): ThreadMessage => {
    const headers = msg.payload?.headers;
    const { name: senderName, email: senderEmail } = parseFrom(
      getHeader(headers, "From"),
    );
    const { textBody, htmlBody, attachments } = parseMimeTree(
      (msg.payload ?? {}) as PartLike,
    );

    return {
      id: msg.id!,
      senderName,
      senderEmail,
      to: getHeader(headers, "To"),
      subject: getHeader(headers, "Subject"),
      date: msg.internalDate
        ? new Date(Number(msg.internalDate)).toISOString()
        : null,
      textBody,
      htmlBody,
      attachments,
      unread: msg.labelIds?.includes("UNREAD") ?? false,
      starred: msg.labelIds?.includes("STARRED") ?? false,
    };
  });

  return { id: thread.id!, messages };
}
