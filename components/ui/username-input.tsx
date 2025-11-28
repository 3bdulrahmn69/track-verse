'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FiUser } from 'react-icons/fi';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { validateUsername } from '@/lib/validation';
import { useDebounce } from '@/hooks/useDebounce';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onAvailabilityChange?: (available: boolean | null) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  checkAvailability?: boolean;
  currentUsername?: string; // For profile settings to avoid checking current username
  className?: string;
}

export function UsernameInput({
  value,
  onChange,
  onAvailabilityChange,
  onValidationChange,
  placeholder = 'Enter your username',
  disabled = false,
  autoFocus = false,
  checkAvailability = true,
  currentUsername,
  className,
}: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Debounce username for checking availability
  const debouncedUsername = useDebounce(value, 500);

  // Validate username locally
  useEffect(() => {
    const validation = validateUsername(value);
    setValidationError(validation.isValid ? '' : validation.message || '');
    onValidationChange?.(validation.isValid, validation.message);
  }, [value, onValidationChange]);

  // Check username availability when debounced value changes
  useEffect(() => {
    if (checkAvailability) {
      checkUsernameAvailability(debouncedUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsername, checkAvailability]);

  const checkUsernameAvailability = async (username: string) => {
    // Don't check if username is empty, too short, or same as current
    if (!username || username === currentUsername) {
      setIsAvailable(null);
      onAvailabilityChange?.(null);
      return;
    }

    // Don't check if validation fails
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setIsAvailable(null);
      onAvailabilityChange?.(null);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/user/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setIsAvailable(data.available);
      onAvailabilityChange?.(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(null);
      onAvailabilityChange?.(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow alphanumeric characters and underscores
    const sanitizedValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
    onChange(sanitizedValue);
  };

  const getRightIcon = () => {
    if (value.length < 3) return null;

    if (isChecking) {
      return (
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      );
    }

    if (isAvailable === true && value !== currentUsername) {
      return <MdCheckCircle className="w-5 h-5 text-green-500" />;
    }

    if (isAvailable === false) {
      return <MdClose className="w-5 h-5 text-red-500" />;
    }

    return null;
  };

  const getHelperText = () => {
    if (isAvailable === true && value !== currentUsername && !validationError) {
      return 'Username is available!';
    }
    if (validationError) {
      return validationError;
    }
    return '3-20 characters, letters, numbers, and underscores only';
  };

  const getError = () => {
    if (validationError) return validationError;
    if (isAvailable === false) return 'Username is already taken';
    return undefined;
  };

  return (
    <Input
      type="text"
      label="Username"
      icon={<FiUser className="w-4 h-4" />}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      error={getError()}
      helperText={getHelperText()}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete="username"
      rightIcon={getRightIcon()}
      className={className}
      maxLength={20}
    />
  );
}
