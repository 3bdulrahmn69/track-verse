import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'icon' | 'full';
  showText?: boolean;
}

export function AppLogo({
  href = '/',
  className,
  size = 'md',
  variant = 'full',
  showText = true,
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const baseClasses =
    'font-bold text-primary hover:text-primary/90 transition-colors';

  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Placeholder for future icon/logo */}
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
        <span className="text-primary font-bold text-sm">TV</span>
      </div>

      {/* Text content */}
      {showText && variant !== 'icon' && (
        <span className={cn(baseClasses, sizeClasses[size])}>Track Verse</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
