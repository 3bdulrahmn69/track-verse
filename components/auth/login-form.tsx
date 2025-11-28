'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import BackButton from '@/components/shared/back-button';
import {
  MdVisibility,
  MdVisibilityOff,
  MdLogin,
  MdMovie,
  MdSportsEsports,
  MdMenuBook,
} from 'react-icons/md';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { validateIdentifier, validateLoginPassword } from '@/lib/validation';

export default function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect authenticated users to portal
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/portal');
    }
  }, [status, session, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate identifier (email or username)
    const identifierValidation = validateIdentifier(formData.identifier);
    if (!identifierValidation.isValid) {
      newErrors.identifier = identifierValidation.message!;
    }

    // Validate password
    const passwordValidation = validateLoginPassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        toast.success('Login successful! Welcome back to Track Verse.', {
          position: 'top-right',
          autoClose: 3000,
        });
        router.push('/portal'); // Redirect to portal
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.', {
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

  const handleInputChange = (field: string, value: string) => {
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
        <div className="absolute top-20 left-10 animate-float opacity-10">
          <MdMovie className="w-16 h-16 text-primary" />
        </div>
        <div
          className="absolute top-40 right-20 animate-float-delayed opacity-10"
          style={{ animationDelay: '1s' }}
        >
          <MdSportsEsports className="w-20 h-20 text-primary" />
        </div>
        <div
          className="absolute bottom-32 left-1/4 animate-float opacity-10"
          style={{ animationDelay: '2s' }}
        >
          <MdMenuBook className="w-14 h-14 text-primary" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
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
              <MdLogin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your Track Verse account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            role="form"
            aria-label="Login form"
            noValidate
          >
            <Input
              label="Email or Username"
              type="text"
              icon={<FiMail className="w-4 h-4" />}
              placeholder="Enter your email or username"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              error={errors.identifier}
              disabled={isLoading}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.identifier}
              aria-describedby={
                errors.identifier ? 'identifier-error' : undefined
              }
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={<FiLock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              disabled={isLoading}
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

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
              Sign in with Google
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:text-primary/90 font-medium transition-colors hover:underline"
              >
                Sign up
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
      `}</style>
    </div>
  );
}
