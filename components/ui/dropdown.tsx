'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface DropdownProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  direction?: 'up' | 'down';
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  direction = 'down',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption?.label || placeholder}
        <MdKeyboardArrowDown
          className={cn(
            'ml-2 h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>
      {isOpen && (
        <ul
          className={cn(
            'absolute z-50 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto',
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
          role="listbox"
          aria-label="Select option"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className={cn(
                'px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground',
                option.value === value && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
