'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Landmark,
} from 'lucide-react';

import { ROUTES } from '@/app/_shared/routes';

import { LogoutButton } from '@/app/_features/auth';

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

function NavSidebar({ onNavigate }: { onNavigate?: () => void }) {
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

export { NavSidebar };
