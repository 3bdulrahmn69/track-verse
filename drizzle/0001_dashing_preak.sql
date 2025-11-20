-- Create user_movies table with watch_count
CREATE TABLE IF NOT EXISTS "user_movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" integer NOT NULL,
	"movie_title" varchar(500) NOT NULL,
	"movie_poster_path" varchar(500),
	"movie_release_date" varchar(50),
	"status" "movie_status" NOT NULL,
	"watch_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint

ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
ON DELETE cascade ON UPDATE no action;