/**
 * Validation utilities for forms and user input
 */

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters',
    };
  }
  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): {
  isValid: boolean;
  message?: string;
} {
  if (username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters',
    };
  }
  if (username.length > 20) {
    return {
      isValid: false,
      message: 'Username must be less than 20 characters',
    };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores',
    };
  }
  return { isValid: true };
}

// Full name validation
export function validateFullName(fullName: string): {
  isValid: boolean;
  message?: string;
} {
  if (!fullName.trim()) {
    return { isValid: false, message: 'Full name is required' };
  }
  if (fullName.trim().length < 2) {
    return {
      isValid: false,
      message: 'Full name must be at least 2 characters',
    };
  }
  return { isValid: true };
}

// Date of birth validation
export function validateDateOfBirth(dateOfBirth: string): {
  isValid: boolean;
  message?: string;
} {
  if (!dateOfBirth) {
    return { isValid: false, message: 'Date of birth is required' };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

  if (actualAge < 13) {
    return { isValid: false, message: 'You must be at least 13 years old' };
  }

  return { isValid: true };
}

// Password match validation
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  message?: string;
} {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  return { isValid: true };
}

// Terms acceptance validation
export function validateTermsAcceptance(accepted: boolean): {
  isValid: boolean;
  message?: string;
} {
  if (!accepted) {
    return {
      isValid: false,
      message: 'You must agree to the terms and conditions',
    };
  }
  return { isValid: true };
}

// Login identifier validation (email or username)
export function validateIdentifier(identifier: string): {
  isValid: boolean;
  message?: string;
} {
  if (!identifier.trim()) {
    return { isValid: false, message: 'Email or username is required' };
  }
  return { isValid: true };
}

// Simple password validation for login (less strict)
export function validateLoginPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters',
    };
  }
  return { isValid: true };
}
