import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-95',
          {
            // Enhanced Primary
            'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25':
              variant === 'primary',
            // Enhanced Secondary
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md':
              variant === 'secondary',
            // Enhanced Outline
            'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md':
              variant === 'outline',
            // Enhanced Ghost
            'text-foreground hover:bg-muted hover:text-foreground hover:shadow-sm':
              variant === 'ghost',
            // Enhanced Success
            'bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:shadow-success/25':
              variant === 'success',
            // Enhanced Danger
            'bg-danger text-danger-foreground hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/25':
              variant === 'danger',
            // Enhanced Warning
            'bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg hover:shadow-warning/25':
              variant === 'warning',
            // Enhanced Info
            'bg-info text-info-foreground hover:bg-info/90 hover:shadow-lg hover:shadow-info/25':
              variant === 'info',
            // New Accent
            'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25':
              variant === 'accent',
            // New Muted
            'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground':
              variant === 'muted',
            // New Orange (using orange-500)
            'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25':
              variant === 'orange',
          },
          {
            'h-7 px-2 text-xs': size === 'xs',
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8': size === 'lg',
            'h-12 px-10 text-lg': size === 'xl',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
