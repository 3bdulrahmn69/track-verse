'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FiLock, FiEye, FiEyeOff, FiSave, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';

export function SecurityTab() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
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

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);

    // Validate email
    if (!emailData.newEmail || !emailData.password) {
      toast.error('Please provide both email and password');
      setIsLoadingEmail(false);
      return;
    }

    try {
      const response = await fetch('/api/user/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update email');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          email: emailData.newEmail,
        },
      });

      toast.success('Email updated successfully!');
      setEmailData({
        newEmail: '',
        password: '',
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update email'
      );
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Email Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Email Address
        </h2>
        <p className="text-muted-foreground mb-6">
          Update your email address. You&apos;ll need to verify your password.
        </p>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Current Email:{' '}
              <span className="font-medium text-foreground">
                {session?.user?.email}
              </span>
            </p>
          </div>

          {/* New Email */}
          <div>
            <Input
              id="newEmail"
              type="email"
              label="New Email Address"
              icon={<FiMail className="w-4 h-4" />}
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData({ ...emailData, newEmail: e.target.value })
              }
              placeholder="Enter new email"
              required
            />
          </div>

          {/* Password for verification */}
          <div>
            <Input
              id="emailPassword"
              type={showPasswords.emailPassword ? 'text' : 'password'}
              label="Current Password"
              icon={<FiLock className="w-4 h-4" />}
              value={emailData.password}
              onChange={(e) =>
                setEmailData({ ...emailData, password: e.target.value })
              }
              placeholder="Enter your password to verify"
              helperText="Required to confirm email change"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      emailPassword: !showPasswords.emailPassword,
                    })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.emailPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoadingEmail}>
              <FiSave className="w-4 h-4 mr-2" />
              {isLoadingEmail ? 'Updating...' : 'Update Email'}
            </Button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Password</h2>
        <p className="text-muted-foreground mb-6">
          Update your password to keep your account secure.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
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
              rightIcon={
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          {/* New Password */}
          <div>
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
              rightIcon={
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          {/* Confirm Password */}
          <div>
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
              rightIcon={
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <FiSave className="w-4 h-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
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
