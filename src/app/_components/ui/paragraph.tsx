import { cn } from '@/app/_lib/utils';

import { ParagraphProps } from './types';

function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn('leading-7 not-first:mt-6', className)}>{children}</p>
  );
}

export { Paragraph };
