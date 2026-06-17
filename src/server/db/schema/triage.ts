import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

// Enums
export const ActionCategory = {
  REPLY: "reply",
  APPROVAL: "approval",
  MEETING: "meeting",
  WAITING: "waiting",
  OVERDUE: "overdue",
} as const;
export type ActionCategory =
  (typeof ActionCategory)[keyof typeof ActionCategory];

export const ActionUrgency = {
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
} as const;
export type ActionUrgency = (typeof ActionUrgency)[keyof typeof ActionUrgency];

export const AutonomyLevel = {
  NEEDS_REVIEW: "needs_review",
  NEEDS_APPROVAL: "needs_approval",
} as const;
export type AutonomyLevel = (typeof AutonomyLevel)[keyof typeof AutonomyLevel];

export const ActionStatus = {
  PENDING: "pending",
  ACTIONED: "actioned",
  DISMISSED: "dismissed",
} as const;
export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

export const ExecutedBy = {
  AI_AUTO: "ai_auto",
  USER: "user",
} as const;
export type ExecutedBy = (typeof ExecutedBy)[keyof typeof ExecutedBy];

export const ThreadTrackingStatus = {
  OPEN: "open",
  FULFILLED: "fulfilled",
  DROPPED: "dropped",
} as const;
export type ThreadTrackingStatus =
  (typeof ThreadTrackingStatus)[keyof typeof ThreadTrackingStatus];

export const TriageRunTrigger = {
  SCHEDULED: "scheduled",
  REALTIME: "realtime",
  MANUAL: "manual",
} as const;
export type TriageRunTrigger =
  (typeof TriageRunTrigger)[keyof typeof TriageRunTrigger];

export const TriageRunStatus = {
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type TriageRunStatus =
  (typeof TriageRunStatus)[keyof typeof TriageRunStatus];

export const actionItems = pgTable(
  "action_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id").notNull(),
    messageId: text("message_id").notNull(),
    category: text("category").notNull().$type<ActionCategory>(),
    urgency: text("urgency").notNull().$type<ActionUrgency>(),
    sender: text("sender").notNull(),
    subject: text("subject").notNull(),
    aiSummary: text("ai_summary").notNull(),
    deadline: timestamp("deadline", { withTimezone: true, precision: 3 }),
    suggestedAction: text("suggested_action").notNull(),
    draftReply: text("draft_reply"),
    proposedSlot: jsonb("proposed_slot").$type<{
      start: string;
      end: string;
    } | null>(),
    autonomy: text("autonomy").notNull().$type<AutonomyLevel>(),
    autonomyReason: text("autonomy_reason").notNull(),
    riskFactors: jsonb("risk_factors").notNull().default([]).$type<string[]>(),
    status: text("status")
      .notNull()
      .default(ActionStatus.PENDING)
      .$type<ActionStatus>(),
    executedBy: text("executed_by").$type<ExecutedBy>(),
    executedAt: timestamp("executed_at", { withTimezone: true, precision: 3 }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("action_items_user_message_unique").on(t.userId, t.messageId)],
);

export const threadTracking = pgTable(
  "thread_tracking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id").notNull(),
    subject: text("subject"),
    recipientEmail: text("recipient_email"),

    lastSentAt: timestamp("last_sent_at", { withTimezone: true, precision: 3 }),
    lastInboundAt: timestamp("last_inbound_at", {
      withTimezone: true,
      precision: 3,
    }),
    expectsReply: boolean("expects_reply").notNull().default(false),
    replyReceived: boolean("reply_received").notNull().default(false),
    commitmentText: text("commitment_text"),
    dueDate: timestamp("due_date", { withTimezone: true, precision: 3 }),
    status: text("status")
      .notNull()
      .default(ThreadTrackingStatus.OPEN)
      .$type<ThreadTrackingStatus>(),

    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("thread_tracking_user_thread_unique").on(t.userId, t.threadId),
  ],
);

export const triageRuns = pgTable("triage_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull().$type<TriageRunTrigger>(),
  startedAt: timestamp("started_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true, precision: 3 }),
  emailsProcessed: integer("emails_processed").notNull().default(0),
  itemsCreated: integer("items_created").notNull().default(0),
  tokensUsed: integer("tokens_used").notNull().default(0),
  status: text("status")
    .notNull()
    .default(TriageRunStatus.RUNNING)
    .$type<TriageRunStatus>(),
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
});

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  user: one(user, { fields: [actionItems.userId], references: [user.id] }),
}));

export const threadTrackingRelations = relations(threadTracking, ({ one }) => ({
  user: one(user, { fields: [threadTracking.userId], references: [user.id] }),
}));

export const triageRunsRelations = relations(triageRuns, ({ one }) => ({
  user: one(user, { fields: [triageRuns.userId], references: [user.id] }),
}));
