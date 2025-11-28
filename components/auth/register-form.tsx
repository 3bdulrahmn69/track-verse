'use client';

import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MdPersonAdd,
  MdEmail,
  MdMovie,
  MdSportsEsports,
  MdMenuBook,
} from 'react-icons/md';
import { FiUser } from 'react-icons/fi';
// import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import Link from 'next/link';
// import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateDateOfBirth,
  validatePasswordMatch,
  validateTermsAcceptance,
} from '@/lib/validation';
import BackButton from '@/components/shared/back-button';
import { RegistrationStep1 } from './registration-step1';
import { RegistrationStep2 } from './registration-step2';
import { RegistrationStep3 } from './registration-step3';
import { RegistrationProgress } from './registration-progress';

export default function RegisterForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    username: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved registration data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('registrationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only load data if it's less than 24 hours old
        const isExpired =
          parsed.timestamp &&
          Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          setFormData(
            parsed.formData || {
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
              dateOfBirth: '',
              username: '',
              agreeToTerms: false,
            }
          );
          setCurrentStep(parsed.currentStep || 1);
          setOtp(parsed.otp || '');
          setUsernameAvailable(parsed.usernameAvailable || null);
          setShowPassword(parsed.showPassword || false);
          setShowConfirmPassword(parsed.showConfirmPassword || false);
        } else {
          localStorage.removeItem('registrationData');
        }
      } catch (error) {
        console.error('Error loading saved registration data:', error);
        localStorage.removeItem('registrationData');
      }
    }
  }, []);

  // Save registration data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      formData,
      currentStep,
      otp,
      usernameAvailable,
      showPassword,
      showConfirmPassword,
      timestamp: Date.now(),
    };
    localStorage.setItem('registrationData', JSON.stringify(dataToSave));
  }, [
    formData,
    currentStep,
    otp,
    usernameAvailable,
    showPassword,
    showConfirmPassword,
  ]);

  // Clear saved data on successful registration
  const clearSavedData = () => {
    localStorage.removeItem('registrationData');
  };

  // Redirect authenticated users to portal
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/portal');
    }
  }, [status, session, router]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    const fullNameValidation = validateFullName(formData.fullName);
    if (!fullNameValidation.isValid) {
      newErrors.fullName = fullNameValidation.message!;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    // Validate password match
    const passwordMatchValidation = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!passwordMatchValidation.isValid) {
      newErrors.confirmPassword = passwordMatchValidation.message!;
    }

    // Validate date of birth
    const dobValidation = validateDateOfBirth(formData.dateOfBirth);
    if (!dobValidation.isValid) {
      newErrors.dateOfBirth = dobValidation.message!;
    }

    // Validate terms acceptance
    const termsValidation = validateTermsAcceptance(formData.agreeToTerms);
    if (!termsValidation.isValid) {
      newErrors.agreeToTerms = termsValidation.message!;
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

    // Check if username is valid (validated by UsernameInput component)
    if (!isUsernameValid) {
      newErrors.username = 'Please choose a valid and available username';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (validateStep1()) {
        // Send OTP
        setIsSendingOTP(true);
        try {
          const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              type: 'verification',
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
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateStep2()) {
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
          type: 'verification',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.error || 'Invalid verification code');
        return;
      }

      toast.success('Email verified successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      setCurrentStep(3);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
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
          email: formData.email,
          type: 'verification',
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

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtp('');
      setOtpError('');
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step first
    if (currentStep === 1) {
      await handleNext(e as React.FormEvent<HTMLFormElement>);
      return;
    }

    if (currentStep === 2) {
      await handleVerifyOTP();
      return;
    }

    // If on step 3, validate and submit
    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Registration failed. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      toast.success('Account created successfully! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Clear saved data and reset form
      clearSavedData();
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     await signIn('google', { callbackUrl: '/portal' });
  //   } catch (error) {
  //     console.error('Google sign in error:', error);
  //     toast.error('Google sign in failed. Please try again.', {
  //       position: 'top-right',
  //       autoClose: 5000,
  //     });
  //   }
  // };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Reset username availability when username changes
    if (field === 'username') {
      setUsernameAvailable(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Icons */}
        <div className="absolute top-20 right-10 animate-float opacity-10">
          <MdMovie className="w-16 h-16 text-primary" />
        </div>
        <div
          className="absolute top-40 left-20 animate-float-delayed opacity-10"
          style={{ animationDelay: '1s' }}
        >
          <MdSportsEsports className="w-20 h-20 text-primary" />
        </div>
        <div
          className="absolute bottom-32 right-1/4 animate-float opacity-10"
          style={{ animationDelay: '2s' }}
        >
          <MdMenuBook className="w-14 h-14 text-primary" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/" label="Back to Home" variant="ghost" />
        </div>

        <Card className="w-full backdrop-blur-sm bg-card/95 shadow-2xl border-border/50 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-scale-in">
              {currentStep === 1 ? (
                <MdPersonAdd className="w-8 h-8 text-primary" />
              ) : currentStep === 2 ? (
                <MdEmail className="w-8 h-8 text-primary" />
              ) : (
                <FiUser className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStep === 1
                ? 'Create Account'
                : currentStep === 2
                ? 'Verify Email'
                : 'Choose Username'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 1
                ? 'Join Track Verse and start tracking your entertainment'
                : currentStep === 2
                ? 'Enter the code sent to your email'
                : 'Pick a unique username for your profile'}
            </p>
          </div>

          {/* Enhanced Progress Indicator */}
          <RegistrationProgress currentStep={currentStep} />

          <form
            onSubmit={currentStep === 1 ? handleNext : handleSubmit}
            className="space-y-4"
            role="form"
            aria-label="Registration form"
            noValidate
          >
            {currentStep === 1 ? (
              <RegistrationStep1
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                isLoading={isLoading}
                isSendingOTP={isSendingOTP}
                onInputChange={handleInputChange}
                onPasswordToggle={() => setShowPassword(!showPassword)}
                onConfirmPasswordToggle={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            ) : currentStep === 2 ? (
              <RegistrationStep2
                email={formData.email}
                otp={otp}
                otpError={otpError}
                isVerifying={isVerifying}
                isSendingOTP={isSendingOTP}
                onOtpChange={(value) => {
                  setOtp(value);
                  setOtpError('');
                }}
                onResendOTP={handleResendOTP}
                onBack={handleBack}
              />
            ) : (
              <RegistrationStep3
                username={formData.username}
                isLoading={isLoading}
                onInputChange={handleInputChange}
                onBack={handleBack}
                onUsernameValidChange={setIsUsernameValid}
                isUsernameValid={isUsernameValid}
              />
            )}
          </form>

          {/* {currentStep === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Sign up with Google
              </Button>
            </>
          )} */}

          {currentStep === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/90 font-medium transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
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
