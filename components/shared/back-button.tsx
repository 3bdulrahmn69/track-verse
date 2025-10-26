'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MdArrowBack } from 'react-icons/md';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'accent'
    | 'muted'
    | 'orange';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  iconOnly?: boolean;
}

export default function BackButton({
  href,
  label = 'Back',
  variant = 'ghost',
  size = 'sm',
  className = '',
  onClick,
  iconOnly = false,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={className}
      aria-label={iconOnly ? label : undefined}
    >
      <MdArrowBack className="w-4 h-4" />
      {!iconOnly && <span className="ml-2">{label}</span>}
    </Button>
  );
}
