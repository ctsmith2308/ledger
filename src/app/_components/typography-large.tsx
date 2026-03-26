import { cn } from '@/app/_lib/tailwind';
import { TypographyLargeProps } from './types';

function TypographyLarge({ children, className }: TypographyLargeProps) {
  return (
    <div className={cn('text-lg font-semibold', className)}>{children}</div>
  );
}

export { TypographyLarge };
