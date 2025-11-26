CREATE TYPE "public"."book_status" AS ENUM('want_to_read', 'read');--> statement-breakpoint
CREATE TYPE "public"."follow_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('want_to_play', 'playing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."movie_status" AS ENUM('want_to_watch', 'watched');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('follow_request', 'follow_accepted', 'follow');--> statement-breakpoint
CREATE TYPE "public"."review_item_type" AS ENUM('movie', 'tv_episode', 'book', 'game');--> statement-breakpoint
CREATE TYPE "public"."tv_show_status" AS ENUM('want_to_watch', 'watching', 'completed', 'stopped_watching');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"follow_id" uuid,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" varchar(255) NOT NULL,
	"item_type" "review_item_type" NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"book_title" varchar(500) NOT NULL,
	"book_cover_id" integer,
	"book_authors" text,
	"book_first_publish_year" integer,
	"status" "book_status" NOT NULL,
	"pages_read" integer,
	"total_pages" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_tv_show_id" uuid NOT NULL,
	"tv_show_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"episode_name" varchar(500),
	"runtime" integer,
	"watched" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"status" "follow_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" integer NOT NULL,
	"game_name" varchar(500) NOT NULL,
	"game_slug" varchar(500),
	"game_background_image" varchar(500),
	"game_released" varchar(50),
	"status" "game_status" NOT NULL,
	"rating" integer,
	"avg_playtime" integer,
	"metacritic" integer,
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
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_follow_id_user_follows_id_fk" FOREIGN KEY ("follow_id") REFERENCES "public"."user_follows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_tv_show_id_user_tv_shows_id_fk" FOREIGN KEY ("user_tv_show_id") REFERENCES "public"."user_tv_shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tv_shows" ADD CONSTRAINT "user_tv_shows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_game_unique" ON "user_games" USING btree ("user_id","game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_tv_show_unique" ON "user_tv_shows" USING btree ("user_id","tv_show_id");