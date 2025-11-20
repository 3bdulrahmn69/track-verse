CREATE TYPE "public"."movie_status" AS ENUM('want_to_watch', 'watched');--> statement-breakpoint
CREATE TABLE "user_movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" integer NOT NULL,
	"movie_title" varchar(500) NOT NULL,
	"movie_poster_path" varchar(500),
	"movie_release_date" varchar(50),
	"status" "movie_status" NOT NULL,
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
	"date_of_birth" date NOT NULL,
	"google_id" varchar(255),
	"provider" varchar(50) DEFAULT 'local' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;