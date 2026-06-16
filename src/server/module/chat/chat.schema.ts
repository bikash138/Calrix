import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  timezone: z.string().optional().default("UTC"),
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(100)
    .refine(
      (msgs) => msgs[msgs.length - 1].role === "user",
      { message: "Last message must be from the user" },
    )
    .refine(
      (msgs) => msgs.every((m, i) => i === 0 || m.role !== msgs[i - 1].role),
      { message: "Messages must alternate roles" },
    ),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
