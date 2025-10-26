'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import BackButton from '@/components/shared/back-button';
import {
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdArrowForward,
  MdPersonAdd,
  MdMovie,
  MdSportsEsports,
  MdMenuBook,
  MdCheckCircle,
} from 'react-icons/md';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateDateOfBirth,
  validatePasswordMatch,
  validateTermsAcceptance,
} from '@/lib/validation';

export default function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
    const newErrors: Record<string, string> = {};

    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step first
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
      return;
    }

    // If on step 2, validate and submit
    if (!validateStep2()) {
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

      // Reset form and redirect to login
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

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/portal' });
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign in failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
              <MdPersonAdd className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStep === 1 ? 'Create Account' : 'Choose Username'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 1
                ? 'Join Track Verse and start tracking your entertainment'
                : 'Pick a unique username for your profile'}
            </p>
          </div>

          {/* Enhanced Progress Indicator */}
          <div
            className="flex items-center justify-center mb-6"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={2}
            aria-label={`Registration progress: Step ${currentStep} of 2`}
          >
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
                className={`w-16 h-1 transition-all duration-300 ${
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
                2
              </div>
            </div>
          </div>

          <form
            onSubmit={currentStep === 1 ? handleNext : handleSubmit}
            className="space-y-4"
            role="form"
            aria-label="Registration form"
            noValidate
          >
            {currentStep === 1 ? (
              // Step 1: Basic Information
              <div className="space-y-4 animate-slide-in">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                  error={errors.fullName}
                  disabled={isLoading}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!errors.fullName}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  disabled={isLoading}
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    error={errors.password}
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange('dateOfBirth', e.target.value)
                  }
                  error={errors.dateOfBirth}
                  disabled={isLoading}
                  autoComplete="bday"
                  aria-required="true"
                  aria-invalid={!!errors.dateOfBirth}
                />

                <div
                  className={
                    errors.agreeToTerms
                      ? 'p-3 rounded-lg border border-danger bg-danger/5'
                      : ''
                  }
                >
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        handleInputChange('agreeToTerms', e.target.checked)
                      }
                      disabled={isLoading}
                      aria-required="true"
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-primary hover:text-primary/90 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-primary hover:text-primary/90 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-danger mt-2">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  Continue
                  <MdArrowForward className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Step 2: Username
              <div className="space-y-4 animate-slide-in">
                <Input
                  label="Username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  error={errors.username}
                  helperText="3-20 characters, letters, numbers, and underscores only"
                  disabled={isLoading}
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={!!errors.username}
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {currentStep === 1 && (
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
          )}

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
