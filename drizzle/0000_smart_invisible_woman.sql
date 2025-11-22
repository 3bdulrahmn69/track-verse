CREATE TYPE "public"."movie_status" AS ENUM('want_to_watch', 'watched');--> statement-breakpoint
CREATE TYPE "public"."tv_show_status" AS ENUM('want_to_watch', 'watching', 'completed', 'dropped');--> statement-breakpoint
CREATE TABLE "user_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_tv_show_id" uuid NOT NULL,
	"tv_show_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"episode_name" varchar(500),
	"runtime" integer,
	"user_rating" integer,
	"user_comment" text,
	"watched" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" integer NOT NULL,
	"movie_title" varchar(500) NOT NULL,
	"movie_poster_path" varchar(500),
	"movie_release_date" varchar(50),
	"status" "movie_status" NOT NULL,
	"watch_count" integer DEFAULT 0 NOT NULL,
	"runtime" integer,
	"user_rating" integer,
	"user_comment" text,
	"tmdb_rating" integer,
	"imdb_id" varchar(20),
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
	"tmdb_rating" integer,
	"total_seasons" integer DEFAULT 0 NOT NULL,
	"total_episodes" integer DEFAULT 0 NOT NULL,
	"watched_episodes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255),
	"date_of_birth" date,
	"image" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"google_id" varchar(255),
	"provider" varchar(50) DEFAULT 'local' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_tv_show_id_user_tv_shows_id_fk" FOREIGN KEY ("user_tv_show_id") REFERENCES "public"."user_tv_shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_shows" ADD CONSTRAINT "user_tv_shows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;