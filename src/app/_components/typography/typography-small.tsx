import { cn } from '@/app/_shared/lib/tailwind';
import { TypographySmallProps } from './types';

function TypographySmall({ children, className }: TypographySmallProps) {
  return (
    <small className={cn('text-sm leading-none font-medium', className)}>
      {children}
    </small>
  );
}

export { TypographySmall };
