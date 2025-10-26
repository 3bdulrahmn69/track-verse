import RegisterForm from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Track Verse - Create Your Free Account',
  description:
    'Join Track Verse today and start tracking your entertainment journey. Create a free account to organize movies, TV shows, games, books, and build your personal entertainment library.',
  keywords: [
    'sign up',
    'register',
    'create account',
    'track verse',
    'entertainment tracker',
    'free account',
  ],
  openGraph: {
    title: 'Join Track Verse - Create Your Account',
    description: 'Start your entertainment tracking journey with Track Verse',
    type: 'website',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
