'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import OTPInput from '@/components/ui/otp-input';
import { MdArrowBack } from 'react-icons/md';

interface RegistrationStep2Props {
  email: string;
  otp: string;
  otpError: string;
  isVerifying: boolean;
  isSendingOTP: boolean;
  onOtpChange: (value: string) => void;
  onResendOTP: () => void;
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function RegistrationStep2({
  email,
  otp,
  otpError,
  isVerifying,
  isSendingOTP,
  onOtpChange,
  onResendOTP,
  onBack,
}: RegistrationStep2Props) {
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown timer when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset countdown when resending
  const handleResend = () => {
    onResendOTP();
    setCountdown(30);

    // Clear existing timer and start new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;
  };

  const canResend = countdown === 0 && !isSendingOTP;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit verification code to
        </p>
        <p className="text-sm font-semibold text-foreground">{email}</p>
      </div>

      <OTPInput
        value={otp}
        onChange={(value) => {
          onOtpChange(value);
        }}
        error={otpError}
        disabled={isVerifying}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="text-sm text-primary hover:text-primary/90 font-medium transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingOTP
            ? 'Sending...'
            : countdown > 0
            ? `Resend code in ${countdown}s`
            : "Didn't receive the code? Resend"}
        </button>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isVerifying}
          className="flex-1"
        >
          <MdArrowBack className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isVerifying || otp.length !== 6}
          aria-busy={isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </div>
  );
}
