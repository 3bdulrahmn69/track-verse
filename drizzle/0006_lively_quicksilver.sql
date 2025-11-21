CREATE TYPE "public"."tv_show_status" AS ENUM('want_to_watch', 'watching', 'completed', 'dropped');--> statement-breakpoint
CREATE TABLE "user_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_tv_show_id" uuid NOT NULL,
	"tv_show_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"episode_name" varchar(500),
	"watched" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tv_shows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tv_show_id" integer NOT NULL,
	"tv_show_name" varchar(500) NOT NULL,
	"tv_show_poster_path" varchar(500),
	"tv_show_first_air_date" varchar(50),
	"status" "tv_show_status" NOT NULL,
	"user_rating" integer,
	"user_comment" text,
	"tmdb_rating" integer,
	"total_seasons" integer DEFAULT 0 NOT NULL,
	"total_episodes" integer DEFAULT 0 NOT NULL,
	"watched_episodes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_tv_show_id_user_tv_shows_id_fk" FOREIGN KEY ("user_tv_show_id") REFERENCES "public"."user_tv_shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_shows" ADD CONSTRAINT "user_tv_shows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;