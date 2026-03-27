'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Settings,
  LogOut,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { logoutAction } from '@/app/_entities/identity';

import { Button } from '@/app/_components';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => execute(logoutAction()),
    onSuccess: () => {
      router.push('/login');
    },
  });

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

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));

            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500'
                  }
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            disabled={isPending}
            onClick={() => logout()}
          >
            <LogOut className="size-4 text-zinc-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export { DashboardHeader };
