import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  service: text("service"),
  message: text("message").notNull(),
  consentAt: text("consent_at").notNull(),
  notificationStatus: text("notification_status").notNull().default("pending"),
});

export const submissionLimits = sqliteTable("submission_limits", {
  ipHash: text("ip_hash").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
});
