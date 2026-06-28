import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const FactCategory = {
  IDENTITY: "identity",
  PREFERENCE: "preference",
  RELATIONSHIP: "relationship",
  WORK: "work",
  OTHER: "other",
} as const;
export type FactCategory = (typeof FactCategory)[keyof typeof FactCategory];

export const FACT_CATEGORY_LABEL: Record<FactCategory, string> = {
  identity: "Identity",
  preference: "Preferences",
  relationship: "People",
  work: "Work context",
  other: "Other",
};

export const FACT_CATEGORY_ORDER: FactCategory[] = [
  "identity",
  "preference",
  "relationship",
  "work",
  "other",
];

export const FactSource = {
  USER_STATED: "user_stated",
  INFERRED: "inferred",
} as const;
export type FactSource = (typeof FactSource)[keyof typeof FactSource];

export const MAX_FACTS_PER_USER = 20;

export const userFacts = pgTable(
  "user_facts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: text("category").notNull().$type<FactCategory>(),
    content: text("content").notNull(),
    source: text("source")
      .notNull()
      .default(FactSource.USER_STATED)
      .$type<FactSource>(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("user_facts_user_idx").on(t.userId)],
);

export const userFactsRelations = relations(userFacts, ({ one }) => ({
  user: one(user, { fields: [userFacts.userId], references: [user.id] }),
}));
