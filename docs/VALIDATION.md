# Validation Functions Documentation

## Overview

All validation functions are centralized in `lib/validation.ts` for consistency and reusability across the application.

## Available Validation Functions

### 1. `validateEmail(email: string): boolean`

Validates email format using regex pattern.

**Parameters:**

- `email` - Email address to validate

**Returns:**

- `true` if email format is valid
- `false` otherwise

**Example:**

```typescript
import { validateEmail } from '@/lib/validation';

if (validateEmail('user@example.com')) {
  // Email is valid
}
```

---

### 2. `validatePassword(password: string): { isValid: boolean; message?: string }`

Validates password strength for registration.

**Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&\*)

**Parameters:**

- `password` - Password to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

**Example:**

```typescript
import { validatePassword } from '@/lib/validation';

const result = validatePassword('MyP@ssw0rd');
if (!result.isValid) {
  console.error(result.message);
}
```

---

### 3. `validateUsername(username: string): { isValid: boolean; message?: string }`

Validates username format and length.

**Requirements:**

- Minimum 3 characters
- Maximum 20 characters
- Alphanumeric characters and underscores only

**Parameters:**

- `username` - Username to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

**Example:**

```typescript
import { validateUsername } from '@/lib/validation';

const result = validateUsername('user_123');
if (!result.isValid) {
  console.error(result.message);
}
```

---

### 4. `validateFullName(fullName: string): { isValid: boolean; message?: string }`

Validates full name.

**Requirements:**

- Not empty (after trim)
- Minimum 2 characters

**Parameters:**

- `fullName` - Full name to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

---

### 5. `validateDateOfBirth(dateOfBirth: string): { isValid: boolean; message?: string }`

Validates date of birth and age requirement.

**Requirements:**

- Valid date format
- User must be at least 13 years old

**Parameters:**

- `dateOfBirth` - Date string to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

**Example:**

```typescript
import { validateDateOfBirth } from '@/lib/validation';

const result = validateDateOfBirth('2005-01-15');
if (!result.isValid) {
  console.error(result.message);
}
```

---

### 6. `validatePasswordMatch(password: string, confirmPassword: string): { isValid: boolean; message?: string }`

Validates that two passwords match.

**Parameters:**

- `password` - Original password
- `confirmPassword` - Confirmation password

**Returns:**

- Object with `isValid` boolean and optional `message` string

**Example:**

```typescript
import { validatePasswordMatch } from '@/lib/validation';

const result = validatePasswordMatch('password123', 'password123');
if (!result.isValid) {
  console.error(result.message);
}
```

---

### 7. `validateTermsAcceptance(accepted: boolean): { isValid: boolean; message?: string }`

Validates that terms and conditions were accepted.

**Parameters:**

- `accepted` - Boolean indicating acceptance

**Returns:**

- Object with `isValid` boolean and optional `message` string

---

### 8. `validateIdentifier(identifier: string): { isValid: boolean; message?: string }`

Validates login identifier (email or username).

**Parameters:**

- `identifier` - Email or username to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

---

### 9. `validateLoginPassword(password: string): { isValid: boolean; message?: string }`

Validates password for login (less strict than registration).

**Requirements:**

- Not empty
- Minimum 6 characters

**Parameters:**

- `password` - Password to validate

**Returns:**

- Object with `isValid` boolean and optional `message` string

---

## Usage Examples

### In React Components

```typescript
import { validateEmail, validatePassword } from '@/lib/validation';

function MyForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
  };
}
```

### In API Routes

```typescript
import { validateEmail, validatePassword } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return NextResponse.json(
      { error: passwordValidation.message },
      { status: 400 }
    );
  }

  // Continue with registration...
}
```

---

## File Structure

```
lib/
├── validation.ts        # All validation functions
├── auth.ts             # Password hashing/verification only
└── db/
    └── schema.ts       # Database schema
```

## Why Separate Validation?

1. **Reusability**: Use same validation in forms and API routes
2. **Consistency**: Ensure same rules everywhere
3. **Maintainability**: Update rules in one place
4. **Testability**: Easy to unit test
5. **Type Safety**: TypeScript types for better DX

## Testing

All validation functions can be easily unit tested:

```typescript
import { validatePassword } from '@/lib/validation';

describe('validatePassword', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('Short1!');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('at least 8 characters');
  });

  it('should accept valid passwords', () => {
    const result = validatePassword('ValidP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });
});
```
