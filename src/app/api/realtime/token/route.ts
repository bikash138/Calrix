import { NextResponse } from "next/server";
import { getSubscriptionToken } from "inngest/realtime";
import { createHandler } from "@/server/api/request-pipeline";
import { inngest } from "@/server/inngest/client";
import { notificationChannel } from "@/server/inngest/channels";

export const GET = createHandler({
  auth: true,
  handler: async ({ user }) => {
    const token = await getSubscriptionToken(inngest, {
      channel: notificationChannel({ userId: user.id }),
      topics: ["triage-progress"],
    });

    return NextResponse.json({ token });
  },
});
