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
  runtime: integer('runtime'), // Duration in minutes
  userRating: integer('user_rating'), // 1-5 star rating
  userComment: text('user_comment'), // User's comment/review
  tmdbRating: integer('tmdb_rating'), // Store TMDB rating for reference
  imdbId: varchar('imdb_id', { length: 20 }), // Store IMDb ID for reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserMovie = typeof userMovies.$inferSelect;
export type NewUserMovie = typeof userMovies.$inferInsert;

// TV Show status enum
export const tvShowStatusEnum = pgEnum('tv_show_status', [
  'want_to_watch',
  'watching',
  'completed',
  'stopped_watching',
]);

// User TV Shows table
export const userTvShows = pgTable('user_tv_shows', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tvShowId: integer('tv_show_id').notNull(), // TMDB TV show ID
  tvShowName: varchar('tv_show_name', { length: 500 }).notNull(),
  tvShowPosterPath: varchar('tv_show_poster_path', { length: 500 }),
  tvShowFirstAirDate: varchar('tv_show_first_air_date', { length: 50 }),
  status: tvShowStatusEnum('status').notNull(),
  tmdbRating: integer('tmdb_rating'), // Store TMDB rating for reference
  totalSeasons: integer('total_seasons').notNull().default(0),
  totalEpisodes: integer('total_episodes').notNull().default(0),
  watchedEpisodes: integer('watched_episodes').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserTvShow = typeof userTvShows.$inferSelect;
export type NewUserTvShow = typeof userTvShows.$inferInsert;

// User Episodes table (for tracking individual episodes)
export const userEpisodes = pgTable('user_episodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  userTvShowId: uuid('user_tv_show_id')
    .notNull()
    .references(() => userTvShows.id, { onDelete: 'cascade' }),
  tvShowId: integer('tv_show_id').notNull(), // TMDB TV show ID
  seasonNumber: integer('season_number').notNull(),
  episodeNumber: integer('episode_number').notNull(),
  episodeName: varchar('episode_name', { length: 500 }),
  runtime: integer('runtime'), // runtime in minutes
  userRating: integer('user_rating'), // 1-5 star rating
  userComment: text('user_comment'), // User's comment/review
  watched: boolean('watched').notNull().default(false),
  watchedAt: timestamp('watched_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserEpisode = typeof userEpisodes.$inferSelect;
export type NewUserEpisode = typeof userEpisodes.$inferInsert;

// Follow status enum
export const followStatusEnum = pgEnum('follow_status', [
  'pending',
  'accepted',
  'rejected',
]);

// User Follows table (for follow relationships)
export const userFollows = pgTable('user_follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: uuid('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // User who is following
  followingId: uuid('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // User being followed
  status: followStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserFollow = typeof userFollows.$inferSelect;
export type NewUserFollow = typeof userFollows.$inferInsert;

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'follow_request',
  'follow_accepted',
  'follow',
]);

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Recipient of notification
  fromUserId: uuid('from_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // User who triggered the notification
  type: notificationTypeEnum('type').notNull(),
  followId: uuid('follow_id').references(() => userFollows.id, {
    onDelete: 'cascade',
  }), // Reference to follow request (for follow-related notifications)
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
