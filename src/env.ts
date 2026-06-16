import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production"], {
        error: 'NODE_ENV must be either "development" or "production"',
      })
      .default("development"),
    FRONTEND_URL: z.url({ error: "FRONTEND_URL must be a valid URL" }),
    DATABASE_URL: z
      .string({ error: "DATABASE_URL is required" })
      .min(1, "DATABASE_URL cannot be empty"),

    OPENAI_API_KEY: z
      .string({ error: "OPENAI_API_KEY is required" })
      .min(1, "OPENAI_API_KEY cannot be empty"),

    BETTER_AUTH_SECRET: z
      .string({ error: "BETTER_AUTH_SECRET is required" })
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.url({ error: "BETTER_AUTH_URL must be a valid URL" }),

    GOOGLE_CLIENT_ID: z
      .string({ error: "GOOGLE_CLIENT_ID is required" })
      .min(1, "GOOGLE_CLIENT_ID cannot be empty"),
    GOOGLE_CLIENT_SECRET: z
      .string({ error: "GOOGLE_CLIENT_SECRET is required" })
      .min(1, "GOOGLE_CLIENT_SECRET cannot be empty"),

    CORSAIR_KEK: z
      .string({ error: "CORSAIR_KEK is required" })
      .min(1, "CORSAIR_KEK cannot be empty"),

    INNGEST_DEV: z
      .string()
      .refine((v) => v === "1", { message: 'INNGEST_DEV must be "1"' })
      .optional(),
    INNGEST_EVENT_KEY: z.string().min(1).optional(),
    INNGEST_SIGNING_KEY: z.string().min(1).optional(),

    GMAIL_PUBSUB_TOPIC: z
      .string({ error: "GMAIL_PUBSUB_TOPIC is required" })
      .min(1, "GMAIL_PUBSUB_TOPIC cannot be empty"),
    GMAIL_WEBHOOK_SECRET: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "development") {
      if (!data.INNGEST_DEV) {
        ctx.addIssue({
          code: "custom",
          message: 'INNGEST_DEV must be set to "1" in development',
          path: ["INNGEST_DEV"],
        });
      }
    }
    if (data.NODE_ENV === "production") {
      if (!data.INNGEST_EVENT_KEY) {
        ctx.addIssue({
          code: "custom",
          message: "INNGEST_EVENT_KEY is required in production",
          path: ["INNGEST_EVENT_KEY"],
        });
      }
      if (!data.INNGEST_SIGNING_KEY) {
        ctx.addIssue({
          code: "custom",
          message: "INNGEST_SIGNING_KEY is required in production",
          path: ["INNGEST_SIGNING_KEY"],
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
