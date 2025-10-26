import { pgTable, uuid, varchar, timestamp, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullname: varchar('fullname', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // Nullable for OAuth users
  dateOfBirth: date('date_of_birth').notNull(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  provider: varchar('provider', { length: 50 }).notNull().default('local'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
