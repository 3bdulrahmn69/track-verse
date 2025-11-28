import Link from 'next/link';
import { Container } from '@/components/layout/container';
import ThemeToggle from '../shared/theme-toggle';
import { AppLogo } from '../shared/app-logo';
import { FiHeart } from 'react-icons/fi';

const quickLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
];

export default function Footer() {
  return (
    <footer className="bg-card py-12 px-4 border-t border-border">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Description */}
          <div>
            <div className="mb-4">
              <AppLogo size="lg" showText={false} />
            </div>
            <p className="text-muted-foreground mb-4">
              Everything, Everywhere, All at once. Your comprehensive tracking
              dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Manage movies, series, games, books, and more in one organized
              place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <h3 className="font-semibold mb-4">Developer</h3>
            <p className="text-muted-foreground mb-2 flex items-center gap-1">
              Built with <FiHeart className="text-red-500" /> by
            </p>
            <Link
              href="https://3bdulrahmn.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Abdulrahman Moussa
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Full-Stack Developer passionate about creating intuitive web
              applications.
            </p>
            <ThemeToggle variant="icons" className="mt-2" />
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              &copy; 2025{' '}
              <span className="text-primary font-bold">Track Verse</span>. All
              rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
