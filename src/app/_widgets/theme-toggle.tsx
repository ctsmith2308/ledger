'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { type VariantProps } from 'class-variance-authority';

import { Button, buttonVariants } from '@/app/_components';

type IconSize = Extract<
  NonNullable<VariantProps<typeof buttonVariants>['size']>,
  'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
>;

function ThemeToggle({ size = 'icon' }: { size?: IconSize }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="size-4 dark:hidden" />

      <Moon className="size-4 hidden dark:block" />
    </Button>
  );
}

export { ThemeToggle };
