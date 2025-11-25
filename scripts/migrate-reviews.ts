import 'dotenv/config';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(DATABASE_URL);

async function migrateReviews() {
  console.log('Starting review migration...');

  try {
    // First, create the reviews table and enum type
    console.log('Creating reviews table...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE review_item_type AS ENUM('movie', 'tv_episode', 'book', 'game');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id varchar(255) NOT NULL,
        item_type review_item_type NOT NULL,
        rating integer NOT NULL,
        comment text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Migrate book reviews
    console.log('Migrating book reviews...');
    const bookResult = await sql`
      INSERT INTO reviews (user_id, item_id, item_type, rating, comment, created_at, updated_at)
      SELECT 
        user_id,
        book_id,
        'book'::review_item_type,
        user_rating,
        user_comment,
        created_at,
        updated_at
      FROM user_books
      WHERE user_rating IS NOT NULL
    `;
    console.log(`Migrated ${bookResult.count} book reviews`);

    // Migrate movie reviews
    console.log('Migrating movie reviews...');
    const movieResult = await sql`
      INSERT INTO reviews (user_id, item_id, item_type, rating, comment, created_at, updated_at)
      SELECT 
        user_id,
        movie_id::text,
        'movie'::review_item_type,
        user_rating,
        user_comment,
        created_at,
        updated_at
      FROM user_movies
      WHERE user_rating IS NOT NULL
    `;
    console.log(`Migrated ${movieResult.count} movie reviews`);

    // Migrate episode reviews
    console.log('Migrating episode reviews...');
    const episodeResult = await sql`
      INSERT INTO reviews (user_id, item_id, item_type, rating, comment, created_at, updated_at)
      SELECT 
        user_id,
        tv_show_id::text || '-S' || season_number || 'E' || episode_number,
        'tv_episode'::review_item_type,
        user_rating,
        user_comment,
        created_at,
        updated_at
      FROM user_episodes
      WHERE user_rating IS NOT NULL
    `;
    console.log(`Migrated ${episodeResult.count} episode reviews`);

    // Now drop the old columns
    console.log('Dropping old review columns...');
    await sql`
      ALTER TABLE user_books 
      DROP COLUMN IF EXISTS user_rating,
      DROP COLUMN IF EXISTS user_comment;
    `;

    await sql`
      ALTER TABLE user_movies 
      DROP COLUMN IF EXISTS user_rating,
      DROP COLUMN IF EXISTS user_comment;
    `;

    await sql`
      ALTER TABLE user_episodes 
      DROP COLUMN IF EXISTS user_rating,
      DROP COLUMN IF EXISTS user_comment;
    `;

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrateReviews()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
