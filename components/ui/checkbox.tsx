import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { MdCheck } from 'react-icons/md';

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity">
            <MdCheck className="h-3 w-3" />
          </div>
        </div>
        {label && (
          <label className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
