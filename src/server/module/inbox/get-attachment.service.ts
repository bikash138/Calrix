import { ApiError } from "@/server/errors/api.error";
import { corsair } from "@/server/corsair";

const PREVIEWABLE = new Set(["application/pdf"]);

function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    PREVIEWABLE.has(mimeType)
  );
}

export type AttachmentResponse = {
  buffer: Buffer;
  mimeType: string;
  disposition: string;
};

export async function getAttachment(
  userId: string,
  messageId: string,
  attachmentId: string,
  filename: string,
  mimeType: string,
): Promise<AttachmentResponse> {
  const tenant = corsair.withTenant(userId);
  const accessToken = await tenant.gmail.keys.get_access_token();
  if (!accessToken) throw ApiError.unauthorized();

  const gmailRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!gmailRes.ok) {
    if (gmailRes.status === 404) throw ApiError.notFound("Attachment not found");
    throw ApiError.providerApiError("Failed to fetch attachment from Gmail");
  }

  const { data } = (await gmailRes.json()) as { data: string; size: number };
  if (!data) throw ApiError.notFound("Attachment data is empty");

  const buffer = Buffer.from(data, "base64url");
  const safeFilename = filename.replace(/[^\w.\-() ]/g, "_");
  const disposition = isPreviewable(mimeType)
    ? `inline; filename="${safeFilename}"`
    : `attachment; filename="${safeFilename}"`;

  return { buffer, mimeType, disposition };
}
