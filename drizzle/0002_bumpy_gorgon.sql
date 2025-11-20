ALTER TABLE "users" ADD COLUMN "image" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;