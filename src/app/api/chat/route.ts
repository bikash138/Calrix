import { createHandler } from "@/server/api/request-pipeline";
import { chatRequestSchema } from "@/server/module/chat/chat.schema";
import { chatService } from "@/server/module/chat/chat.service";

export const POST = createHandler({
  auth: true,
  rateLimit: "chat",
  schema: chatRequestSchema,
  handler: async ({ user, body }) =>
    chatService.stream(user.id, user.name, body),
});
