import React from 'react';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  onClick,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];

  if (!src) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-muted flex items-center justify-center text-muted-foreground ${className} ${
          onClick ? 'cursor-pointer hover:bg-muted/80 transition-colors' : ''
        }`}
        onClick={onClick}
      >
        <FiUser className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden relative ${className} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={
          size === 'xl'
            ? '128px'
            : size === 'lg'
            ? '96px'
            : size === 'md'
            ? '64px'
            : '40px'
        }
      />
    </div>
  );
}
