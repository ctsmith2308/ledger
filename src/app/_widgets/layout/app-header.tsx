'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';

import { Button } from '@/app/_components';
import { ROUTES } from '@/app/_shared/routes';

import { SiteHeader } from '@/app/_components';
import { ThemeToggle } from '@/app/_features/theme/ui/theme-toggle';

function AppHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <SiteHeader
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

export { AppHeader };
