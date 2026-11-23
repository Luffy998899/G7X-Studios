DROP INDEX `leads_appointment_at_unique`;--> statement-breakpoint
ALTER TABLE `leads` ADD `status` text DEFAULT 'booked' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `completed_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `leads_active_appointment_unique` ON `leads` (`appointment_at`) WHERE status = 'booked';