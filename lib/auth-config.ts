import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        // Check if identifier is email or username
        const isEmail = identifier.includes('@');

        // Find user by email or username
        const user = await db.query.users.findFirst({
          where: isEmail
            ? eq(users.email, identifier)
            : eq(users.username, identifier),
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullname,
          email: user.email,
          username: user.username,
          dateOfBirth: user.dateOfBirth || undefined,
          isPublic: user.isPublic || false,
          image: user.image || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!),
        });

        if (!existingUser) {
          // Create new user from Google profile
          const username = user.email?.split('@')[0] || `user_${Date.now()}`;

          await db.insert(users).values({
            fullname: user.name || 'User',
            email: user.email!,
            username,
            googleId: account.providerAccountId,
            provider: 'google',
            dateOfBirth: '2000-01-01', // Default date, should be updated by user
            password: null,
          });
        } else if (!existingUser.googleId) {
          // Link Google account to existing user
          await db
            .update(users)
            .set({
              googleId: account.providerAccountId,
              provider: 'google',
            })
            .where(eq(users.id, existingUser.id));
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.dateOfBirth = user.dateOfBirth;
        token.isPublic = user.isPublic;
        token.picture = user.image;
      }
      if (account?.provider === 'google') {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email!),
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.dateOfBirth = dbUser.dateOfBirth;
          token.isPublic = dbUser.isPublic || false;
          token.picture = dbUser.image;
        }
      }
      // Handle session update trigger - fetch fresh data from DB
      if (trigger === 'update') {
        if (session?.user) {
          // Update token with session data
          token = { ...token, ...session.user };
        }
        // Fetch fresh data from database to ensure we have latest image and dateOfBirth
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.dateOfBirth = dbUser.dateOfBirth;
          token.isPublic = dbUser.isPublic || false;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Fetch fresh user data from database on every session call
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.fullname;
          session.user.email = dbUser.email;
          session.user.username = dbUser.username;
          session.user.image = dbUser.image;
          session.user.isPublic = dbUser.isPublic || false;

          // Format dateOfBirth for display
          if (dbUser.dateOfBirth) {
            session.user.dateOfBirth = dbUser.dateOfBirth;
          }
        } else {
          // Fallback to token data if DB fetch fails
          session.user.id = token.id as string;
          session.user.username = token.username as string;
          session.user.isPublic = token.isPublic as boolean | undefined;
          session.user.image = token.picture as string | null | undefined;

          if (token.dateOfBirth && typeof token.dateOfBirth === 'string') {
            session.user.dateOfBirth = token.dateOfBirth;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
