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

import { LogoutButton } from '@/app/_features/auth';

import { AppHeader } from './app-header';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== '/dashboard' && pathname.startsWith(href));

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

function DashboardSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppHeader onMenuToggle={() => setDrawerOpen(true)} />

      <aside className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-60 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

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
