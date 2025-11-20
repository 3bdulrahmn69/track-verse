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
          dateOfBirth: user.dateOfBirth,
          isPublic: user.isPublic || false,
          image: user.image || null,
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
        }
      }
      // Handle session update trigger
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.dateOfBirth = token.dateOfBirth as string | undefined;
        session.user.isPublic = token.isPublic as boolean | undefined;
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
