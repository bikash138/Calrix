import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth";

export const accountRepo = {
  deleteByUserId: (userId: string) =>
    db.delete(user).where(eq(user.id, userId)),
};
