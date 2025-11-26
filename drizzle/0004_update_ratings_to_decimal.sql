-- Update rating columns from integer to decimal to support ratings like 8.4, 4.8, etc.

-- Update user_movies table
ALTER TABLE "user_movies" ALTER COLUMN "tmdb_rating" TYPE DECIMAL(3,1);

-- Update user_tv_shows table
ALTER TABLE "user_tv_shows" ALTER COLUMN "tmdb_rating" TYPE DECIMAL(3,1);

-- Update user_games table
ALTER TABLE "user_games" ALTER COLUMN "rating" TYPE DECIMAL(3,1);

-- Update reviews table
ALTER TABLE "reviews" ALTER COLUMN "rating" TYPE DECIMAL(3,1);

-- Add comments for clarity
COMMENT ON COLUMN "user_movies"."tmdb_rating" IS 'TMDB rating with decimal precision (e.g., 8.4)';
COMMENT ON COLUMN "user_tv_shows"."tmdb_rating" IS 'TMDB rating with decimal precision (e.g., 8.4)';
COMMENT ON COLUMN "user_games"."rating" IS 'User personal rating with decimal precision (1-10, e.g., 8.4)';
COMMENT ON COLUMN "reviews"."rating" IS 'Review rating with decimal precision (1-10, e.g., 8.4)';