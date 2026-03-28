'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Landmark,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
} from '@/app/_components';

import { ROUTES } from '@/app/_lib/config';

import { LogoutButton } from '@/app/_features/auth';

import { AppHeader } from './app-header';

const navItems = [
  { href: ROUTES.overview, label: 'Overview', icon: LayoutDashboard },
  { href: ROUTES.transactions, label: 'Transactions', icon: ArrowLeftRight },
  { href: ROUTES.budgets, label: 'Budgets', icon: PiggyBank },
  { href: ROUTES.accounts, label: 'Accounts', icon: Landmark },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== ROUTES.overview && pathname.startsWith(href));

        return (
          <Link key={href} href={href} onClick={onNavigate}>
            <span
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />

              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-2 pt-2">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="p-2">
        <LogoutButton />
      </div>
    </div>
  );
}

function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppHeader onMenuToggle={() => setDrawerOpen(true)} />

      <div className="mx-auto mt-14 flex h-[calc(100vh-3.5rem-1.5rem)] max-w-7xl gap-6 px-6 py-3">
        <aside className="hidden w-56 shrink-0 rounded-xl border border-border bg-card lg:block">
          <SidebarContent />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card">
          {children}
        </div>
      </div>

      <Dialog open={drawerOpen} onOpenChange={(value) => setDrawerOpen(value)}>
        <DialogContent
          className="fixed inset-y-0 left-0 top-0 h-full w-72 max-w-none -translate-x-0 -translate-y-0 rounded-none rounded-r-xl pt-4 sm:max-w-none"
          showCloseButton={false}
        >
          <SidebarContent onNavigate={() => setDrawerOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DashboardSidebar };
