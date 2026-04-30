'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

import { ROUTES } from '@/app/_shared/routes';

import { ThemeToggle } from '@/app/_features/theme/ui/theme-toggle';

import { Button, MenuBar } from '@/app/_components';

function AppMenuBar({ left }: { left?: React.ReactNode }) {
  return (
    <MenuBar
      logoHref={ROUTES.overview}
      left={left}
      right={
        <>
          <ThemeToggle />

          <Link href={ROUTES.settings}>
            <Button variant="ghost" size="icon" aria-label="Account settings">
              <User className="size-4 text-muted-foreground" />
            </Button>
          </Link>
        </>
      }
    />
  );
}

export { AppMenuBar };
