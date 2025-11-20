import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground block mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground pointer-events-none z-10">
              {icon}
            </div>
          )}
          <input
            className={cn(
              'flex h-11 w-full rounded-full border-2 border-border bg-background/50 backdrop-blur-sm py-2.5 text-sm font-medium transition-all duration-200',
              icon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              'placeholder:text-muted-foreground/60 placeholder:font-normal',
              'hover:border-primary/50 hover:bg-background/80',
              'focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-background',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
              'shadow-sm hover:shadow-md focus:shadow-lg',
              error &&
                'border-destructive/50 focus:ring-destructive/20 focus:border-destructive hover:border-destructive/70',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground z-10">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
            <span className="text-base">⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground/80">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
