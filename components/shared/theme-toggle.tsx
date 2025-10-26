'use client';

import { useTheme } from 'next-themes';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { MdLightMode, MdDarkMode, MdComputer } from 'react-icons/md';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'icons' | 'cycle';
  direction?: 'up' | 'down';
  className?: string;
}

// Default dropdown variant
const options = [
  {
    value: 'light',
    label: 'Light',
    icon: <MdLightMode />,
    ariaLabel: 'Switch to light mode',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <MdDarkMode />,
    ariaLabel: 'Switch to dark mode',
  },
  {
    value: 'system',
    label: 'System',
    icon: <MdComputer />,
    ariaLabel: 'Switch to system mode',
  },
];

export default function ThemeToggle({
  variant = 'dropdown',
  direction = 'down',
  className = '',
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return null;
  }

  if (variant === 'icons') {
    return (
      <div
        className={cn(
          'w-fit flex items-center gap-1 p-1 bg-muted/50 rounded-full border border-border/50',
          className
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`p-2 rounded-full transition-all duration-200 ${
              theme === option.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            aria-label={option.ariaLabel}
          >
            {option.icon}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'cycle') {
    const currentOption =
      options.find((option) => option.value === theme) || options[0];

    const cycleTheme = () => {
      const currentIndex = options.findIndex(
        (option) => option.value === theme
      );
      const nextIndex = (currentIndex + 1) % options.length;
      setTheme(options[nextIndex].value);
    };

    return (
      <button
        onClick={cycleTheme}
        className={cn(
          'p-2 rounded-full bg-muted/50 border border-border/50 text-primary hover:bg-muted transition-colors duration-200',
          className
        )}
        aria-label={`Current theme: ${currentOption.label}. Click to cycle themes.`}
      >
        {currentOption.icon}
      </button>
    );
  }

  return (
    <Dropdown
      options={options}
      value={theme}
      onChange={setTheme}
      placeholder="Theme"
      className={cn('w-24', className)}
      direction={direction}
    />
  );
}
