'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import OTPInput from '@/components/ui/otp-input';
import BackButton from '@/components/shared/back-button';
import {
  MdVisibility,
  MdVisibilityOff,
  MdLockReset,
  MdCheckCircle,
  MdEmail,
  MdArrowBack,
  MdArrowForward,
} from 'react-icons/md';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validation';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState('');

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    const passwordMatchValidation = validatePasswordMatch(
      password,
      confirmPassword
    );
    if (!passwordMatchValidation.isValid) {
      newErrors.confirmPassword = passwordMatchValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1()) {
      return;
    }

    setIsSendingOTP(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send verification code', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      toast.success('Verification code sent to your email!', {
        position: 'top-right',
        autoClose: 3000,
      });

      setCurrentStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send verification code', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          type: 'reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.error || 'Invalid verification code');
        return;
      }

      toast.success('Code verified! Set your new password.', {
        position: 'top-right',
        autoClose: 3000,
      });

      setCurrentStep(3);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      toast.success('Password reset successfully! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    setOtp('');
    setOtpError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to resend code', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      toast.success('New verification code sent!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend code', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtp('');
      setOtpError('');
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/login" label="Back to Login" variant="ghost" />
        </div>

        <Card className="w-full backdrop-blur-sm bg-card/95 shadow-2xl border-border/50 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-scale-in">
              {currentStep === 1 ? (
                <MdLockReset className="w-8 h-8 text-primary" />
              ) : currentStep === 2 ? (
                <MdEmail className="w-8 h-8 text-primary" />
              ) : (
                <FiLock className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStep === 1
                ? 'Forgot Password'
                : currentStep === 2
                ? 'Verify Email'
                : 'New Password'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 1
                ? 'Enter your email to reset your password'
                : currentStep === 2
                ? 'Enter the code sent to your email'
                : 'Create a new strong password'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= 1
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 1 ? <MdCheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <div
                className={`w-12 h-1 transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 2 ? <MdCheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <div
                className={`w-12 h-1 transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= 3
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            <form
              onSubmit={handleSendOTP}
              className="space-y-4 animate-slide-in"
            >
              <Input
                label="Email"
                type="email"
                icon={<FiMail className="w-4 h-4" />}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                error={errors.email}
                disabled={isSendingOTP}
                autoComplete="email"
              />

              <Button type="submit" className="w-full" disabled={isSendingOTP}>
                {isSendingOTP ? 'Sending...' : 'Send Verification Code'}
                <MdArrowForward className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : currentStep === 2 ? (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6 animate-slide-in"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit verification code to
                </p>
                <p className="text-sm font-semibold text-foreground">{email}</p>
              </div>

              <OTPInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setOtpError('');
                }}
                error={otpError}
                disabled={isLoading}
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                  className="text-sm text-primary hover:text-primary/90 font-medium transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOTP
                    ? 'Sending...'
                    : "Didn't receive the code? Resend"}
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <MdArrowBack className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4 animate-slide-in"
            >
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                icon={<FiLock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                }
                placeholder="Create a new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                error={errors.password}
                disabled={isLoading}
                autoComplete="new-password"
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={<FiLock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                }
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                error={errors.confirmPassword}
                disabled={isLoading}
                autoComplete="new-password"
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <MdArrowBack className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
