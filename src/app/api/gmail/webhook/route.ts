import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { processWebhook } from "corsair";
import { decodePubSubMessage } from "@corsair-dev/gmail";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";
import { env } from "@/env";

const pubSubBodySchema = z.object({
  message: z.object({ data: z.string() }).optional(),
});

export const POST = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get("token");
  if (env.GMAIL_WEBHOOK_SECRET && token !== env.GMAIL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof pubSubBodySchema>;
  try {
    body = pubSubBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body.message?.data;
  if (!raw) {
    return NextResponse.json({ ok: true });
  }

  let payload: { emailAddress?: string; historyId?: string };
  try {
    payload = decodePubSubMessage(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { emailAddress } = payload;
  if (!emailAddress) {
    return NextResponse.json({ ok: true });
  }

  const userRow = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, emailAddress))
    .limit(1);

  if (!userRow[0]) {
    return NextResponse.json({ ok: true });
  }

  const userId = userRow[0].id;

  const headers = Object.fromEntries(req.headers.entries());
  await processWebhook(corsair, headers, body, { tenantId: userId });

  return NextResponse.json({ ok: true });
};
