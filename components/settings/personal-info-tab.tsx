'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { UsernameInput } from '@/components/ui/username-input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/date-picker';
import { FiSave, FiUser, FiCamera, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export function PersonalInfoTab() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [pendingImageFile, setPendingImageFile] = useState<string>('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    dateOfBirth: '',
    image: '',
  });

  useEffect(() => {
    if (session?.user) {
      // Format dateOfBirth for input field (YYYY-MM-DD)
      let formattedDate = '';
      if (session.user.dateOfBirth) {
        // Handle both Date object and string
        const date =
          typeof session.user.dateOfBirth === 'string'
            ? new Date(session.user.dateOfBirth)
            : session.user.dateOfBirth;

        if (date instanceof Date && !isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        } else if (typeof session.user.dateOfBirth === 'string') {
          // If it's already a string in YYYY-MM-DD format
          formattedDate = session.user.dateOfBirth;
        }
      }

      setFormData({
        name: session.user.name || '',
        username: session.user.username || '',
        dateOfBirth: formattedDate,
        image: session.user.image || '',
      });
      setPreviewImage(session.user.image || '');
    }
  }, [session]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type - only allow png, jpg, webp
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or WEBP image');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Only create preview - don't upload yet
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setPendingImageFile(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    // Just clear the preview and pending file
    // Actual deletion from Cloudinary will happen on Save
    setPreviewImage('');
    setPendingImageFile('');
    setFormData({ ...formData, image: '' });
  };

  const handleCancel = () => {
    // Reset form to session data
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        username: session.user.username || '',
        dateOfBirth: session.user.dateOfBirth || '',
        image: session.user.image || '',
      });
      setPreviewImage(session.user.image || '');
      setPendingImageFile('');
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      let imageUrl = formData.image;

      // If there's a pending image file, upload it to Cloudinary first
      if (pendingImageFile) {
        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: pendingImageFile }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Update profile with new data
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Trigger session update to fetch fresh data from DB
      await update();

      // Update local state
      setFormData({ ...formData, image: imageUrl });
      setPreviewImage(imageUrl);
      setPendingImageFile('');

      toast.success('Profile updated successfully!');
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
      <div className="flex items-start gap-6">
        {/* Avatar Section - Left Side */}
        <div className="relative group">
          <Avatar src={previewImage} alt={formData.name} size="xl" />
          <label
            htmlFor="image-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
          >
            <input
              id="image-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <FiCamera className="w-8 h-8 text-white" />
          </label>
          {previewImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
              title="Remove image"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info Section - Right Side */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Personal Information
          </h2>
          <p className="text-muted-foreground mb-4">
            Update your personal details and profile information.
          </p>
          <p className="text-sm text-muted-foreground">
            Supported formats: PNG, JPG, WEBP (Max 2MB)
          </p>
        </div>
      </div>

      {/* Form Fields in Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Username */}
        <div>
          <UsernameInput
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            onAvailabilityChange={setUsernameAvailable}
            currentUsername={session?.user?.username}
            disabled={isLoading}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <DatePicker
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
            placeholder="Select your date of birth"
            maxDate={new Date().toISOString().split('T')[0]}
            minDate="1900-01-01"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <FiSave className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
