'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button, ThemeToggle } from '@/app/_components';

function DashboardHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
            <span className="text-xs font-bold text-white">L</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ledger
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Account">
            <User className="size-5 text-zinc-500" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="size-5 text-zinc-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export { DashboardHeader };
