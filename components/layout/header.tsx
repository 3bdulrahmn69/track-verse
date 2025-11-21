'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdMenu, MdClose } from 'react-icons/md';
import ThemeToggle from '@/components/shared/theme-toggle';
import { AppLogo } from '@/components/shared/app-logo';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsAnimating(true);
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
        setIsAnimating(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header
        className={`sticky top-2 md:top-4 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 md:px-6 py-2 md:py-3 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border/50">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <AppLogo href="/" size="md" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
              <ThemeToggle variant="cycle" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen || isAnimating ? (
                <MdClose className="w-5 h-5 text-foreground" />
              ) : (
                <MdMenu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-card shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 px-6 py-8 mt-12">
              <nav className="space-y-6">
                {navLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-lg font-medium text-foreground hover:text-primary transition-colors duration-200"
                    onClick={toggleMobileMenu}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isMobileMenuOpen
                        ? 'slideInLeft 0.3s ease-out forwards'
                        : 'none',
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Footer with Theme Toggle */}
            <div className="p-6 border-t border-border">
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggle direction="up" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
