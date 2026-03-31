'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { cn } from '@/app/_shared/lib/tailwind';

function PasswordInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 border-0"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="size-4 text-muted-foreground" />
        ) : (
          <Eye className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export { PasswordInput };
