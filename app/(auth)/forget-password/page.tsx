import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Track Verse - Reset Your Password',
  description:
    'Reset your Track Verse password. Enter your email to receive a verification code and create a new password.',
  keywords: [
    'forgot password',
    'reset password',
    'track verse',
    'password recovery',
  ],
};

export default function ForgetPasswordPage() {
  return <ForgotPasswordForm />;
}
