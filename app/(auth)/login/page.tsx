import LoginForm from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Track Verse - Sign In to Your Entertainment Tracker',
  description:
    'Sign in to Track Verse to access your personalized entertainment portal. Track your favorite movies, TV shows, games, books, and more. Manage your watchlists and connect with friends.',
  keywords: [
    'login',
    'sign in',
    'track verse',
    'entertainment tracker',
    'account access',
    'user login',
    'portal access',
  ],
  openGraph: {
    title: 'Login to Track Verse',
    description:
      'Sign in to access your personalized entertainment tracking portal',
    url: 'https://track-verse.vercel.app/login',
    type: 'website',
  },
  alternates: {
    canonical: 'https://track-verse.vercel.app/login',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
