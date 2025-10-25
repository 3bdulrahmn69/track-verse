import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('max-w-7xl mx-auto px-4', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container };
