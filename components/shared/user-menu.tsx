'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiBell,
} from 'react-icons/fi';
import ThemeToggle from '@/components/shared/theme-toggle';
import { signOut, useSession } from 'next-auth/react';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

interface UserMenuProps {
  openUp?: boolean;
}

export function UserMenu({ openUp = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-2">
        {/* Notifications Bell - Hidden on small screens, shown on md+ */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full hover:bg-muted transition-colors duration-200 hidden md:flex"
        >
          <FiBell className="w-5 h-5 text-foreground" />
        </Link>

        {/* User Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors duration-200"
        >
          <Avatar
            src={session?.user?.image}
            alt={session?.user?.name || 'User'}
            size="sm"
          />
          <FiChevronDown
            className={`w-4 h-4 transition-transform duration-200 hidden md:block ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute right-0 w-72 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 ${
            openUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* User Info */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || 'User'}
                size="md"
              />
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
            {/* Notifications - Only shown on small screens */}
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200 md:hidden"
            >
              <div className="relative">
                <FiBell className="w-5 h-5" />
              </div>
              <span>Notifications</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200"
            >
              <FiUser className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200"
            >
              <FiSettings className="w-5 h-5" />
              <span>Settings</span>
            </Link>

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
