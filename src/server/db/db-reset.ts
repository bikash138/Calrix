import { reset } from "drizzle-seed";
import { setupCorsair } from "corsair/setup";
import { env } from "@/env";
import { corsair } from "@/server/corsair";
import { db } from "./index";
import * as authSchema from "./schema/auth";
import * as corsairSchema from "./schema/corsair";

async function main(): Promise<void> {
  await reset(db, { ...authSchema, ...corsairSchema });
  console.log("Database reset");

  const output = await setupCorsair(corsair, {
    credentials: {
      gmail: {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
      },
      googlecalendar: {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
  console.log(output);

  process.exit(0);
}

main();
