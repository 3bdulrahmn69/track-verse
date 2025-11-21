'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CongratulationsProps {
  /** Whether to show the congratulations animation */
  show: boolean;
  /** Callback when the animation should be hidden */
  onHide?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function Congratulations({
  show,
  onHide,
  className,
}: CongratulationsProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onHide?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50', className)}>
      <Image
        src="/assets/congratulations.gif"
        alt="Congratulations!"
        width={1920}
        height={300}
        className="w-full h-auto object-cover"
        unoptimized
      />
    </div>
  );
}
