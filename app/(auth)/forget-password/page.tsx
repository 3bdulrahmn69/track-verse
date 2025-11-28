import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Track Verse - Recover Your Account',
  description:
    'Reset your Track Verse password securely. Enter your email to receive a verification code and create a new password. Regain access to your entertainment tracking account.',
  keywords: [
    'forgot password',
    'reset password',
    'track verse',
    'password recovery',
    'account recovery',
    'password reset',
  ],
  alternates: {
    canonical: 'https://track-verse.vercel.app/forget-password',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgetPasswordPage() {
  return <ForgotPasswordForm />;
}
