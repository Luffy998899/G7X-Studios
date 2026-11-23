import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  service: text("service"),
  message: text("message").notNull(),
  consentAt: text("consent_at").notNull(),
  notificationStatus: text("notification_status").notNull().default("pending"),
  appointmentAt: text("appointment_at"),
  status: text("status").notNull().default("booked"),
  completedAt: text("completed_at"),
}, (table) => [uniqueIndex("leads_active_appointment_unique").on(table.appointmentAt).where(sql`status = 'booked'`)]);

export const submissionLimits = sqliteTable("submission_limits", {
  ipHash: text("ip_hash").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
});
