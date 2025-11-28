'use client';

import { UsernameInput } from '@/components/ui/username-input';
import { Button } from '@/components/ui/button';
import { MdArrowBack } from 'react-icons/md';

interface RegistrationStep3Props {
  username: string;
  isLoading: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onUsernameValidChange?: (isValid: boolean) => void;
  isUsernameValid?: boolean;
}

export function RegistrationStep3({
  username,
  isLoading,
  onInputChange,
  onBack,
  onUsernameValidChange,
  isUsernameValid = false,
}: RegistrationStep3Props) {
  return (
    <div className="space-y-4 animate-slide-in">
      <UsernameInput
        value={username}
        onChange={(value) => onInputChange('username', value)}
        onAvailabilityChange={(available) => {
          // Update the parent component's state
          if (available !== null) {
            onInputChange('usernameAvailable', available);
          }
          // Notify parent about validity change
          onUsernameValidChange?.(available === true);
        }}
        onValidationChange={(isValid, error) => {
          // Update validation errors
          if (!isValid && error) {
            onInputChange('username', username); // Trigger error update
          }
          // Notify parent about validity change
          onUsernameValidChange?.(false);
        }}
        disabled={isLoading}
        autoFocus
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          <MdArrowBack className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || !isUsernameValid}
          aria-busy={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
}
