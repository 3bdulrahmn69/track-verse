'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FiLock, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

export function SecurityTab() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isProfilePublic, setIsProfilePublic] = useState(
    session?.user?.isPublic ?? false
  );

  const handlePrivacyToggle = async (checked: boolean) => {
    setIsProfilePublic(checked);

    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: checked }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy settings');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          isPublic: checked,
        },
      });

      toast.success(`Profile is now ${checked ? 'public' : 'private'}`);
    } catch (error) {
      // Revert the toggle on error
      setIsProfilePublic(!checked);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update privacy'
      );
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setMessage(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Password Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Security</h2>
        <p className="text-muted-foreground mb-6">
          Update your password to keep your account secure.
        </p>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                label="Current Password"
                icon={<FiLock className="w-4 h-4" />}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    current: !showPasswords.current,
                  })
                }
                className="absolute right-3 top-[52%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                label="New Password"
                icon={<FiLock className="w-4 h-4" />}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
                helperText="Must be at least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
                className="absolute right-3 top-[52%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                label="Confirm New Password"
                icon={<FiLock className="w-4 h-4" />}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-[52%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            <FiSave className="w-4 h-4 mr-2" />
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Privacy Section */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Privacy</h2>
        <p className="text-muted-foreground mb-6">
          Control who can see your profile and activity.
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label
              htmlFor="isPublic"
              className="text-sm font-medium cursor-pointer"
            >
              Public Profile
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow other users to view your profile, watched movies, and
              activity. When disabled, your profile will be private.
            </p>
          </div>
          <Switch
            id="isPublic"
            checked={isProfilePublic}
            onCheckedChange={handlePrivacyToggle}
          />
        </div>
      </div>
    </div>
  );
}
