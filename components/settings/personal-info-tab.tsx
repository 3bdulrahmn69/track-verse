'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiSave, FiUser, FiMail, FiCalendar, FiImage } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';

export function PersonalInfoTab() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameError, setUsernameError] = useState<string>('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    dateOfBirth: '',
    image: '',
  });

  // Debounce username for checking availability
  const debouncedUsername = useDebounce(formData.username, 500);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        username: session.user.username || '',
        dateOfBirth: session.user.dateOfBirth || '',
        image: session.user.image || '',
      });
    }
  }, [session]);

  // Check username availability when debounced value changes
  useEffect(() => {
    checkUsernameAvailability(debouncedUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsername]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === session?.user?.username) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    // Validate minimum length
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');
    try {
      const response = await fetch(
        `/api/user/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData({ ...formData, username });
    // Reset states immediately
    setUsernameAvailable(null);
    setUsernameError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate username
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    // Check if username is available
    if (
      formData.username !== session?.user?.username &&
      usernameAvailable === false
    ) {
      toast.error('Username is already taken');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData,
        },
      });

      toast.success('Profile updated successfully!');
      setMessage(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Personal Information
        </h2>
        <p className="text-muted-foreground mb-6">
          Update your personal details and profile information.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Name */}
      <div>
        <Input
          id="name"
          type="text"
          label="Full Name"
          icon={<FiUser className="w-4 h-4" />}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          id="email"
          type="email"
          label="Email Address"
          icon={<FiMail className="w-4 h-4" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Username */}
      <div>
        <div className="space-y-1">
          <div className="relative">
            <Input
              id="username"
              type="text"
              label="Username"
              icon={<FiUser className="w-4 h-4" />}
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Enter your username"
              required
              minLength={3}
            />
            {isCheckingUsername && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Checking...
              </span>
            )}
            {!isCheckingUsername &&
              usernameAvailable === true &&
              formData.username !== session?.user?.username && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                  ✓ Available
                </span>
              )}
            {!isCheckingUsername && usernameAvailable === false && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-sm">
                ✗ Taken
              </span>
            )}
          </div>
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <Input
          id="dateOfBirth"
          type="date"
          label="Date of Birth"
          icon={<FiCalendar className="w-4 h-4" />}
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
        />
      </div>

      {/* Profile Image */}
      <div>
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground block mb-2">
            <div className="flex items-center gap-2">
              <FiImage className="w-4 h-4" />
              <span>Profile Image</span>
            </div>
          </label>
          {formData.image && (
            <div className="flex items-center gap-4">
              <Image
                src={formData.image}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
                width={96}
                height={96}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ ...formData, image: '' })}
              >
                Remove Image
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">Max 2MB</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          <FiSave className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
