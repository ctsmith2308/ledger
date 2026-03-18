import { cn } from '@/lib/utils';
import { TypographyMutedProps } from './types';

function TypographyMuted({ children, className }: TypographyMutedProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export { TypographyMuted };
