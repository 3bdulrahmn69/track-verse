import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  integer,
  pgEnum,
  boolean,
  text,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullname: varchar('fullname', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // Nullable for OAuth users
  dateOfBirth: date('date_of_birth'), // Nullable - user may not provide
  image: text('image'), // Cloudinary URL
  isPublic: boolean('is_public').notNull().default(false),
  googleId: varchar('google_id', { length: 255 }).unique(),
  provider: varchar('provider', { length: 50 }).notNull().default('local'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Movie status enum
export const movieStatusEnum = pgEnum('movie_status', [
  'want_to_watch',
  'watched',
]);

// User movies table
export const userMovies = pgTable('user_movies', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id').notNull(), // TMDB movie ID
  movieTitle: varchar('movie_title', { length: 500 }).notNull(),
  moviePosterPath: varchar('movie_poster_path', { length: 500 }),
  movieReleaseDate: varchar('movie_release_date', { length: 50 }),
  status: movieStatusEnum('status').notNull(),
  watchCount: integer('watch_count').notNull().default(0),
  userRating: integer('user_rating'), // 1-10 star rating
  userComment: text('user_comment'), // User's comment/review
  tmdbRating: integer('tmdb_rating'), // Store TMDB rating for reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserMovie = typeof userMovies.$inferSelect;
export type NewUserMovie = typeof userMovies.$inferInsert;
