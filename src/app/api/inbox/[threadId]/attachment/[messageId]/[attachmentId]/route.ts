import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createHandler } from "@/server/api/request-pipeline";
import { ApiError } from "@/server/errors/api.error";
import { corsair } from "@/server/corsair";

const idSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[^\\/]+$/);
const attachmentIdSchema = z
  .string()
  .min(1)
  .max(4096)
  .regex(/^[^\\/]+$/);

function parseParam(
  raw: string,
  label: string,
  schema: z.ZodString = idSchema,
): string {
  const result = schema.safeParse(raw);
  if (!result.success) throw ApiError.badRequest(`Invalid ${label}`);
  return result.data;
}

const PREVIEWABLE = new Set(["application/pdf"]);

function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    PREVIEWABLE.has(mimeType)
  );
}

export function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      threadId: string;
      messageId: string;
      attachmentId: string;
    }>;
  },
) {
  return createHandler({
    auth: true,
    handler: async ({ user }) => {
      const { threadId, messageId, attachmentId } = await params;

      parseParam(threadId, "thread ID");
      parseParam(messageId, "message ID");
      parseParam(attachmentId, "attachment ID", attachmentIdSchema);

      const filename = req.nextUrl.searchParams.get("filename") ?? "attachment";
      const mimeType =
        req.nextUrl.searchParams.get("mimeType") ?? "application/octet-stream";

      const tenant = corsair.withTenant(user.id);
      const accessToken = await tenant.gmail.keys.get_access_token();
      if (!accessToken) throw ApiError.unauthorized();

      const gmailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!gmailRes.ok) {
        if (gmailRes.status === 404)
          throw ApiError.notFound("Attachment not found");
        throw ApiError.providerApiError(
          "Failed to fetch attachment from Gmail",
        );
      }

      const { data } = (await gmailRes.json()) as {
        data: string;
        size: number;
      };
      if (!data) throw ApiError.notFound("Attachment data is empty");

      const buffer = Buffer.from(data, "base64url");

      const safeFilename = filename.replace(/[^\w.\-() ]/g, "_");
      const disposition = isPreviewable(mimeType)
        ? `inline; filename="${safeFilename}"`
        : `attachment; filename="${safeFilename}"`;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": disposition,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "private, max-age=300",
        },
      });
    },
  })(req);
}
