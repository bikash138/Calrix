import { createHandler } from "@/server/api/request-pipeline";
import { chatRequestSchema } from "@/server/module/chat/chat.schema";
import { chatService } from "@/server/module/chat/chat.service";

export const POST = createHandler({
  auth: true,
  schema: chatRequestSchema,
  handler: async ({ user, body }) => chatService.stream(user.id, user.name, body),
});
