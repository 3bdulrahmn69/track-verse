ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "user_games" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "user_movies" ALTER COLUMN "tmdb_rating" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "user_tv_shows" ALTER COLUMN "tmdb_rating" SET DATA TYPE numeric(3, 1);