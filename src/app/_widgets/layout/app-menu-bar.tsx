'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';

import { ROUTES } from '@/app/_shared/routes';

import { ThemeToggle } from '@/app/_features/theme/ui/theme-toggle';

import { Button, MenuBar } from '@/app/_components';

function AppMenuBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <MenuBar
      logoHref={ROUTES.overview}
      left={
        onMenuToggle ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="size-5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
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
