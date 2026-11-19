CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text,
	`service` text,
	`message` text NOT NULL,
	`consent_at` text NOT NULL,
	`notification_status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_limits` (
	`ip_hash` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL
);
