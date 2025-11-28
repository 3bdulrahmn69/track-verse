'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { FiUser, FiMail, FiLock, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

interface RegistrationStep1Props {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    agreeToTerms: boolean;
  };
  errors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  isSendingOTP: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onPasswordToggle: () => void;
  onConfirmPasswordToggle: () => void;
}

export function RegistrationStep1({
  formData,
  errors,
  showPassword,
  showConfirmPassword,
  isLoading,
  isSendingOTP,
  onInputChange,
  onPasswordToggle,
  onConfirmPasswordToggle,
}: RegistrationStep1Props) {
  return (
    <div className="space-y-4 animate-slide-in">
      <Input
        label="Full Name"
        type="text"
        icon={<FiUser className="w-4 h-4" />}
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={(e) => onInputChange('fullName', e.target.value)}
        error={errors.fullName}
        disabled={isLoading}
        autoComplete="name"
        aria-required="true"
        aria-invalid={!!errors.fullName}
      />

      <Input
        label="Email"
        type="email"
        icon={<FiMail className="w-4 h-4" />}
        placeholder="Enter your email address"
        value={formData.email}
        onChange={(e) => onInputChange('email', e.target.value)}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
        aria-required="true"
        aria-invalid={!!errors.email}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={<FiLock className="w-4 h-4" />}
        rightIcon={
          <button
            type="button"
            onClick={onPasswordToggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </button>
        }
        placeholder="Create a password"
        value={formData.password}
        onChange={(e) => onInputChange('password', e.target.value)}
        error={errors.password}
        disabled={isLoading}
        autoComplete="new-password"
        aria-required="true"
        aria-invalid={!!errors.password}
      />

      <Input
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        icon={<FiLock className="w-4 h-4" />}
        rightIcon={
          <button
            type="button"
            onClick={onConfirmPasswordToggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </button>
        }
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={(e) => onInputChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
        autoComplete="new-password"
        aria-required="true"
        aria-invalid={!!errors.confirmPassword}
      />

      <Input
        label="Date of Birth"
        type="date"
        icon={<FiCalendar className="w-4 h-4" />}
        value={formData.dateOfBirth}
        onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
        error={errors.dateOfBirth}
        disabled={isLoading}
        autoComplete="bday"
        aria-required="true"
        aria-invalid={!!errors.dateOfBirth}
      />

      <div
        className={
          errors.agreeToTerms
            ? 'p-3 rounded-lg border border-destructive bg-destructive/5'
            : ''
        }
      >
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={(e) => onInputChange('agreeToTerms', e.target.checked)}
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
          <p className="text-sm text-destructive mt-2">{errors.agreeToTerms}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSendingOTP}>
        {isSendingOTP ? 'Sending...' : 'Continue'}
        <MdArrowForward className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
