ALTER TABLE `leads` ADD `appointment_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `leads_appointment_at_unique` ON `leads` (`appointment_at`);