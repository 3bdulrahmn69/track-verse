import LoginForm from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Track Verse - Sign In to Your Account',
  description:
    'Sign in to Track Verse to track your favorite movies, TV shows, games, books, and more. Access your personalized entertainment portal.',
  keywords: [
    'login',
    'sign in',
    'track verse',
    'entertainment tracker',
    'account access',
  ],
  openGraph: {
    title: 'Login to Track Verse',
    description:
      'Sign in to access your personalized entertainment tracking portal',
    type: 'website',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
