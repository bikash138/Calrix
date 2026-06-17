import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const ContactSource = {
  GMAIL_HARVEST: "gmail_harvest",
  MANUAL: "manual",
  MENTION: "mention",
} as const;
export type ContactSource = (typeof ContactSource)[keyof typeof ContactSource];

export const contacts = pgTable(
  "contacts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    email: text("email").notNull(),
    source: text("source")
      .notNull()
      .default(ContactSource.GMAIL_HARVEST)
      .$type<ContactSource>(),
    interactionCount: integer("interaction_count").notNull().default(1),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("contacts_user_email_unique").on(t.userId, t.email),
    index("contacts_user_idx").on(t.userId),
  ],
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(user, { fields: [contacts.userId], references: [user.id] }),
}));
