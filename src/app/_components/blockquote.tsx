import { cn } from '@/app/_lib/tailwind';
import { BlockquoteProps } from './types';

function Blockquote({ children, className }: BlockquoteProps) {
  return (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)}>
      {children}
    </blockquote>
  );
}

export { Blockquote };
