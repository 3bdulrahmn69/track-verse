import RegisterForm from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Sign Up | Track Verse - Create Your Free Entertainment Tracker Account',
  description:
    'Join Track Verse today and start tracking your entertainment journey. Create a free account to organize movies, TV shows, games, books, and build your personal entertainment library. Connect with friends and discover new content.',
  keywords: [
    'sign up',
    'register',
    'create account',
    'track verse',
    'entertainment tracker',
    'free account',
    'join track verse',
    'movie tracker signup',
  ],
  openGraph: {
    title: 'Join Track Verse - Create Your Free Account',
    description:
      'Start your entertainment tracking journey with Track Verse. Track movies, TV shows, books, and games.',
    url: 'https://track-verse.vercel.app/register',
    type: 'website',
  },
  alternates: {
    canonical: 'https://track-verse.vercel.app/register',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
