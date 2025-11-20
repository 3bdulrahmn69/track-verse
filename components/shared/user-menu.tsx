'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSettings, FiLogOut, FiChevronDown, FiUser } from 'react-icons/fi';
import ThemeToggle from '@/components/shared/theme-toggle';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserMenuProps {
  openUp?: boolean;
}

export function UserMenu({ openUp = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors duration-200"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
            {getInitials(session?.user?.name)}
          </div>
        )}
        <FiChevronDown
          className={`w-4 h-4 transition-transform duration-200 hidden md:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-72 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 ${
            openUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* User Info */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {getInitials(session?.user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  @{session?.user?.username || 'username'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200"
            >
              <FiUser className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200"
            >
              <FiSettings className="w-5 h-5" />
              <span>Settings</span>
            </button>

            {/* Theme Toggle */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Theme
                </span>
                <ThemeToggle variant="icons" />
              </div>
            </div>

            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors duration-200"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
