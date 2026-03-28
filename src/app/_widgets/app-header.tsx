'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';

import { Button } from '@/app/_components';
import { ThemeToggle } from './theme-toggle';

function AppHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="size-5 text-muted-foreground" />
            </Button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
              <span className="text-xs font-bold text-white">L</span>
            </div>

            <span className="text-sm font-semibold tracking-tight text-foreground">
              Ledger
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/settings">
            <Button variant="ghost" size="icon" aria-label="Account settings">
              <User className="size-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
